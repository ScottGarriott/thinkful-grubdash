const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function doesNameExist(req, res, next){
    const {data: {name} = {} } = req.body

    if(name && name !== ""){
        return next()
    }else{
        return next({
            status: 400,
            message: 'Dish must include a name'
        })
    }
}

function doesDescriptionExist(req, res, next){
    const {data: {description} = {} } = req.body

    if(description && description !== ""){
        return next()
    }else{
        return next({
            status: 400,
            message: 'Dish must include a description'
        })
    }
}

function doesPriceExist(req, res, next){
    const {data: {price} = {} } = req.body

    if(price){
        res.locals.price = price
        return next()
    }else{
        return next({
            status: 400,
            message: 'Dish must include a price'
        })
    }
}

function isPriceValid(req, res, next){
    const price = res.locals.price

    if(Number.isInteger(price) && price > 0){
        return next()
    }else{
        return next({
            status: 400,
            message: 'Dish must have a price that is an integer greater than 0'
        })
    }
}

function doesImgExist(req, res, next){
    const {data: {image_url} = {} } = req.body

    if(image_url && image_url !== ""){
        return next()
    }else{
        return next({
            status: 400,
            message: 'Dish must include a image_url'
        })
    }
}

function doesDishExist(req, res, next){
    const {dishId} = req.params
    const foundDish = dishes.find(dish => dish.id === dishId)

    if(foundDish){
        res.locals.dish = foundDish
        return next()
    }else{
        return next({
            status: 404,
            message: `Dish does not exist: ${dishId}.`
        })
    }
}

function doesDishIdMatchRouteId (req, res, next){
    const dishId = res.locals.dish.id
    const {data: {id} = {} } = req.body

    if(id){
        if(id === dishId){
            return next()
        }else{
            return next({
                status: 400,
                message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
            })
        }
    }else{
        return next()
    }
}

function list(req, res, next){
    res.json({data: dishes})
}

function create(req, res, next){
    const { data: {name, description, price, image_url} = {} } = req.body

    const newDish = {
        id: nextId(),
        name: name,
        description: description,
        price: price,
        image_url: image_url
    }

    dishes.push(newDish)
    res.status(201).json({data: newDish})
}

function read(req, res, next){
    res.json({data: res.locals.dish})
}

function deepEqual(object1, object2){
    if(typeof object1 === 'object' && Object.keys(object1).length > 0){
      return Object.keys(object1).length === Object.keys(object2).length && Object.keys(object1).every(key => deepEqual(object1[key], object2[key]))
    }else{
      return object1 === object2
    }
  }

function update(req, res, next){
    const dish = res.locals.dish
    const newDish = req.body.data

    if(!deepEqual(dish, newDish)){
        
            dish.id = newDish.id
            dish.name = newDish.name
            dish.description = newDish.description
            dish.price = newDish.price
            dish.image_url = newDish.image_url
        
    }
    res.status(200).json({data: newDish})
}

module.exports = {
    list,
    create: [
            doesNameExist, 
            doesDescriptionExist, 
            doesPriceExist, 
            isPriceValid, 
            doesImgExist, 
            create
    ],
    read: [doesDishExist, read],
    update: [
        doesDishExist,
        doesNameExist, 
        doesDescriptionExist, 
        doesPriceExist, 
        isPriceValid, 
        doesImgExist, 
        doesDishIdMatchRouteId,  
        update
    ],
    deepEqual
}