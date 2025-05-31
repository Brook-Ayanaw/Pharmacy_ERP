const express = require('express');
const Role = require('../models/Role');

const router = express.Router();

//home 
router.get('/',(req,res)=>
{
    res.status(200).send('this is the roles route');
});

//get all products
router.get('/all', async(req,res)=>
{
    try 
    {
        const roles = await Role.find();
        if (roles.length>0)
            res.status(200).json(roles);
        else
            res.status(404).json({message: "no roles found"})
        
    } catch(err) 
    {
        res.status(500).json({message: err.message});
    }
})

// Add roles
router.post('/addRole', async (req,res)=>
{
    try{
        const {name} = req.body;
        if(!name)
            return res.status(404).json({message:"Please enter role name"});
        const newRole = new Role({name});
        const savedRole = await newRole.save();
        return res.status(200).json({message:"role added "+ savedRole}); 
    }catch(error)
    {
        res.status(500).json({message:error.message});
    }
})

// Edit role
router.put('/editRole/:id', async (req,res) =>
{
    try{
        const id = req.params.id;
        const updateData = req.body;

        //check if there is data to be updated
        if(!updateData)
            return res.status(400).json({message: "no Data to update"});

        //Find by id and update
        const toBeUpdated = await Role.findByIdAndUpdate(
            id,
            updateData,
            {new: true, runValidators:true}
        )
        if(!toBeUpdated)
            return res.status(404).json({message:"role not found"});

        res.status(200).json({message:"role edited successfully "+ toBeUpdated});
    }catch(error)
    {
        res.status(500).json({message:error.message});
    }
})

// Delete role
router.delete('/deleteRole/:id', async (req,res)=>{
    try
    {
        const id = req.params.id;
        const toBeDeleted = await Role.findByIdAndDelete(id)
    }catch(error)
    {
        res.status(500).json({message:error.message});
    }
})


module.exports = router;