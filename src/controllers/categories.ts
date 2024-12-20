import { response } from "express";
import { Request, Response } from 'express';
import { Category } from "../models/index.js";
import { CategoryInterface } from "../interfaces/category.interface.js";

export const fetchCategories = async (req: Request, res: Response = response) => {
  const { limit = 5, from = 0 } = req.query
  const query = { state: true }

  const [total, categories] = await Promise.all([
    Category.countDocuments(query),
    Category.find(query)
      .populate('user', 'name')
      .skip(Number(from))
      .limit(Number(limit)),
  ])

  res.json({
    total,
    categories,
  })
}

export const fetchCategoryById = async (req: Request, res: Response = response) => {
  const { id } = req.params
  const category: CategoryInterface | null = await Category.findById(id).populate('user', 'name')

  res.json(category)
}

export const createCategory = async (req: Request, res: Response = response) => {
  const name = req.body.name.toUpperCase()

  const categoryDB: CategoryInterface | null = await Category.findOne({ name })

  if (categoryDB) {
    res.status(400).json({
      msg: `Category ${categoryDB.name}, already exists`,
    });
    return;
  }

  const data = {
    name,
    user: req.user?._id,
  }

  const category = new Category(data)

  await category.save()

  res.status(201).json(category)
}

export const updateCategory = async (req: Request, res: Response = response) => {
  const { id } = req.params
  const { state, user, ...data } = req.body

  data.name = data.name.toUpperCase()
  data.user = req.user?._id

  const category: CategoryInterface | null = await Category.findByIdAndUpdate(id, data, { new: true })

  res.json(category)
}

export const deleteCategory = async (req: Request, res: Response = response) => {
  const { id } = req.params
  const deletedCategory: CategoryInterface | null = await Category.findByIdAndUpdate(
    id,
    { state: false },
    { new: true }
  )

  res.json(deletedCategory)
}