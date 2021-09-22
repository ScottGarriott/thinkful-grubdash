const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

const deepEqual = require("../dishes/dishes.controller").deepEqual

function doesDeliverToExist(req, res, next){
    const {data: {deliverTo} = {} } = req.body

    if(deliverTo && deliverTo !== ""){
       return next()
    }
    next({
        status: 400,
        message: 'Order must include a deliverTo'
    })
}

function doesMobileNumberExist(req, res, next){
    const {data: {mobileNumber} = {} } = req.body

    if(mobileNumber && mobileNumber !== ""){
       return next()
    }
    next({
        status: 400,
        message: 'Order must include a mobileNumber'
    })
}

function doDishesExist(req, res, next){
    const {data: {dishes} = {} } = req.body

    if(dishes){
       return next()
    }
    next({
        status: 400,
        message: 'Order must include a dish'
    })
}

function areDishesValid(req, res, next){
    const {data: {dishes} = {} } = req.body

    if(Array.isArray(dishes) && dishes.length > 0){
       return next()
    }
    next({
        status: 400,
        message: 'Order must include at least one dish'
    })
}

function isQuantityValid(req, res, next){
    const {data: {dishes} = {}} = req.body

    for(let i = 0; i < dishes.length; i++){
        const dish = dishes[i]
        const quantity = dish.quantity
        if(!quantity || quantity <= 0 || !Number.isInteger(quantity)){
           return next({
                status: 400,
                message: `Dish ${i} must have a quantity that is an integer greater than 0`
            })
        }
    }
    return next()
}

function doesOrderExist(req, res, next){
    const {orderId} = req.params

    const foundOrder = orders.find(order => order.id === orderId)
    if(foundOrder){
        res.locals.order = foundOrder
        return next()
    }
    next({
        status: 404,
        message: `Order ${orderId} not found`
    })
}

function doIdsMatch(req, res, next){
    const {data: {id} = {} } = req.body
    const orderId = res.locals.order.id

    if(id && id !== orderId){
        return next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`
        })
    }
    next()
}

function doesStatusExist(req, res, next){
    const {data: {status} = {} } = req.body

    if(status && status !== ""){
        return next()
    }
    next({
        status: 400,
        message: 'Order must have a status of pending, preparing, out-for-delivery, delivered'
    })
}

function isStatusDelivered(req, res, next){
    const {data: {status} = {} } = req.body

    if(status === 'delivered'){
        return next({
            status: 400,
            message: 'A delivered order cannot be changed'
        })
    }
    next() 
}

function isStatusInvalid(req, res, next){
    const {data: {status} = {} } = req.body

    if(status === 'invalid'){
        return next({
            status: 400,
            message: 'An order must have a valid status to be changed'
        })
    }
    next() 
}

function isStatusPending(req, res, next){
    const status = res.locals.order.status

    if(status !== 'pending'){
        next({
            status: 400,
            message:'An order cannot be deleted unless it is pending'
        })
    }
    next()
}

function list(req, res, next){
    res.json({data: orders})
}

function create(req, res, next){
    const {data: {deliverTo, dishes, mobileNumber, status} = {} } = req.body

    const newOrder = {
        id: nextId(),
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: dishes
    }
    orders.push(newOrder)

    res.status(201).json({data: newOrder})
}

function read(req, res, next){
    res.json({data: res.locals.order})
}

function update(req, res, next){
    const order = res.locals.order
    const newOrder = req.body.data
    console.log('old: ', order.id, 'new: ', newOrder.id)
    if(!deepEqual(order, newOrder)){
        order.id = order.id
        order.deliverTo = newOrder.deliverTo
        order.mobileNumber = newOrder.mobileNumber
        order.status = newOrder.status
        order.dishes = newOrder.dishes
    }

    res.status(200).json({data: order})
}

function destroy(req, res, next){
    //const {orderId} = req.params

    const index = orders.findIndex(order => order.id === res.locals.order.id)
    orders.splice(index, 1)
    res.sendStatus(204)
}

module.exports = {
    list,
    create: [
        doesDeliverToExist, 
        doesMobileNumberExist, 
        doDishesExist, 
        areDishesValid, 
        isQuantityValid,
        create 
    ],
    read: [doesOrderExist, read],
    update: [
        doesOrderExist,
        doIdsMatch,
        doesStatusExist,
        isStatusDelivered,
        isStatusInvalid,
        doesDeliverToExist, 
        doesMobileNumberExist, 
        doDishesExist, 
        areDishesValid, 
        isQuantityValid,
        update
     ],
    destroy: [doesOrderExist, isStatusPending, destroy]

}