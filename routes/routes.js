const express = require('express');
const router = express.Router();
const User = require('../models/user');
const multer = require('multer');
const fs = require('fs');

// Ensure the uploads directory exists
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

let upload = multer({
    storage
}).single("image"); // Same as the name property in the form.

// Insert a user into the database route:
router.post('/add', upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file ? req.file.filename : null, // Ensure file is saved
        });
        await user.save();
        req.session.message = {
            type: 'success',
            message: 'User added successfully!!'
        };
        res.redirect('/');
    } catch (err) {
        res.json({message: err.message, type: 'danger'});
    }
});

// Render home page with async/await
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.render('index', {
            title: 'Home Page',
            users
        });
    } catch (err) {
        res.json({message: err.message});
    }
});

// Render add user form
router.get('/add', (req, res) => {
    res.render('add_user', {title: "Add Users"});
});

// Edit User
router.get("/edit/:id", async (req, res) => {
    try {
        let id = req.params.id;
        const user = await User.findById(id);
        if (!user) {
            res.redirect("/");
        } else {
            res.render("edit_user", {
                title: "Edit User",
                user: user,
            });
        }
    } catch (err) {
        res.redirect("/");
    }
});

// Update User:
router.post('/update/:id', upload, async (req, res) => {
    try {
        let new_image = "";
        let id = req.params.id;
        if (req.file) {
            new_image = req.file.filename;
            try {
                fs.unlinkSync('./uploads/' + req.body.old_image);  // Corrected the file path
            } catch (err) {
                console.log(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        let user = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        req.session.message = {
            type: 'success',
            message: 'User updated successfully!!'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});


// Delete User
router.get('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const user = await User.findByIdAndDelete(id);  // Corrected the deletion logic
        if (user && user.image) {  // Check if user exists and has an image
            try {
                fs.unlinkSync('./uploads/' + user.image);  // Corrected the file path
            } catch (err) {
                console.log(err);  // Log the error but don't stop execution
            }
        }
        req.session.message = {
            type: 'info',
            message: 'User deleted successfully!!'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});


module.exports = router;
