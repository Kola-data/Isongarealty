import express from 'express';
import * as userServices from "./services.js";
import { authenticateJWT } from "../../utils/authMiddleware.js";

const userRouter = express.Router();

// ✅ All routes will require authentication
userRouter.use(authenticateJWT);

// ✅ Get all users
userRouter.get('/', async (req, res) => {
    try {
        const users = await userServices.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// ✅ Get a user by ID
userRouter.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userServices.getUserById(userId);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});

// ✅ Create a new user (with validation)
userRouter.post('/', async (req, res) => {
    try {
        const newUserId = await userServices.createUser(req.body);
        res.status(201).json({ id: newUserId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// ✅ Update a user (with validation)
userRouter.put('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        await userServices.updateUser(userId, req.body);
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

// ✅ Delete a user
userRouter.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        await userServices.deleteUser(userId);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

export default userRouter;
