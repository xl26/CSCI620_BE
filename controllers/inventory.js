const mongoose = require('mongoose');
const Inventory = require('../model/inventory');

exports.get_all = async (req,res) => {
    
    try {
        console.log("Hello.....")
        // var results = [];
        // Inventory.find({ user_id : req.body.id})
        // .then(data => {
        //     data.map((item, ind) => {
        //         console.log(item);
        //         results.push(item);
        //     })
        // })
        const results = await Inventory.find({ user_id : req.body.user_id});
        console.log(results)
        if(results)
        {
            res.status(200);
            res.send(results);
        }
        else
        {
            res.status(400).json({message : "Couldn't find the details!!"})
        }
    } catch (error) {
        res.status(500).json({message : "Server error!!"})
    }
}


exports.inv_get = async (req,res) => {
    try {
        const { id , user_id } = req.body;
        const result = await Inventory.findOne({_id : id , user_id: user_id}).lean();
        console.log(result)
        if(result)
        {
            res.status(200);
            res.send(result);
        }
        else
        {
            res.status(400).json({message : "Couldn't find the details!!"})
        }
    } catch (error) {
        res.status(500).json({message : "Server error!!"})
    }
}

exports.inv_add = async (req,res) => {
    try {
        const { user_id , name, description, date_aq, approx_v, insurance_v, photo} = req.body;
        const newInv = await Inventory.create({
            user_id,
            name,
            description,
            date_aq,
            approx_v,
            insurance_v,
            photo
        })
        res.status(201).json(newInv);
    } catch (error) {
        res.status(500).send({
            message: "Server error, try again later."
        })
    }
}

exports.inv_edit = async (req,res) => {
    try {
        const { id , changeObj } = req.body;
        const inventory_get = await Inventory.findById({_id : id});
        if(inventory_get)
        {
            var newValues = {$set: {name_inv : changeObj.name, description: changeObj.description, date_aq : changeObj.date_aq, 
                                    approx_v: changeObj.approx_v, insurance_v:  changeObj.insurance_v, photo : changeObj.photo}};
            Inventory.updateOne({id : id} , newValues, (err,res) => {
                if(err)
                {
                    console.log("Error updating!!")
                }
                else

                {
                    res.status(200).json({message : "Document updated!!"});
                }
            })
        }
        else
        {
            res.send({message : "Couldn't find the product!! try again."})
        }
    } catch (error) {
        res.status(500).send({
            message: "Server error, try again later."
        })
    }
}

exports.inv_delete = async (req,res) => {
    try {
        console.log(req.body[0].id);
        var result;
        if(req.body.length === 1)
        {
            console.log("hello!!")
            result = await Inventory.deleteOne({_id : req.body[0].id});
        }
        else
        {
            result = await Inventory.deleteMany({_id : { $in : req.body}});
        }
        console.log(result)
        if(result.deletedCount === 1)
        {
            console.log("Successfully deleted the document!!");
            res.status(200).json({message : "Successfully deleted the selected document."})
        }
        else if(result.deletedCount > 1)
        {
            console.log("Successfully deleted the selected documents!!");
            res.status(200).json({message : "Successfully deleted the selected documents."})
        }
        else
        {
            console.log("No document matched the id. Deleted 0 documents.");
            res.status(501).json({message : "No document matched the id. Deleted 0 documents."});
        }
    } catch (error) {
        res.status(500).send({
            message: "Server error, try again later."
        })
    }
}