import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';

import User from '../models/user.js';
import { UserInterfaceDoc} from '../interfaces/user.interface.js'
import { generateJWT } from '../helpers/generate-jwt.js';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    // Check if email exists
    const user: UserInterfaceDoc | null = await User.findOne({ email })
    if (!user || !user.state) {
      res.status(400).json({
        msg: 'Invalid user or password',
      })
    } else {
      // Validate password
      const validPassword = bcryptjs.compareSync(password, user.password!)
      if (!validPassword) {
        res.status(400).json({
          msg: 'Invalid user or password',
        })
      }
  
      // Generate JWT
      const token = await generateJWT(user._id)
  
      res.json({
        user,
        token,
      })
    }

  } catch (error) {
    console.log(error)
    res.status(500).json({
      msg: 'Comunicate with administrator',
    })
  }
}
