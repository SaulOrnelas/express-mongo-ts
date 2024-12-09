import { response } from "express";
import { Request, Response } from 'express';
import { Dish } from "../models/index.js";

export const fetchDishes = async (req: Request, res: Response = response) => {
  const { limit = 5, from = 0 } = req.query
  const query = { state: true }

  const [total, dishes] = await Promise.all([
    Dish.countDocuments(query),
    Dish.find(query)
      .populate('user', 'name')
      .populate('category', 'name')
      .skip(Number(from))
      .limit(Number(limit)),
  ])

  res.json({
    total,
    dishes,
  })
}

export const fetchDishById = async (req: Request, res: Response = response) => {
  const { id } = req.params
  const dish = await Dish.findById(id)
    .populate('user', 'name')
    .populate('category', 'name')

  res.json(dish)
}

export const createDish = async (req: Request, res: Response = response) => {
  const { state, user, ...body } = req.body

  const dishDB: any = await Dish.findOne({ name: body.name })

  if (dishDB) {
    res.status(400).json({
      msg: `Dish ${dishDB.nombre}, already exists`,
    })
  }

  const data = {
    ...body,
    name: body.name.toUpperCase(),
    user: req.user?._id,
  }

  const dish = new Dish(data)

  await dish.save()

  res.status(201).json(dish)
}

export const updateDish = async (req: Request, res: Response = response) => {
  const { id } = req.params
  const { state, user, ...data } = req.body

  if (data.name) {
    data.name = data.name.toUpperCase()
  }

  data.user = req.user?._id

  const dish = await Dish.findByIdAndUpdate(id, data, { new: true })

  res.json(dish)
}

export const deleteDish = async (req: Request, res: Response = response) => {
  const { id } = req.params
  const deletedDish = await Dish.findByIdAndUpdate(
    id,
    { state: false },
    { new: true }
  )

  res.json(deletedDish)
}