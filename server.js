var express = require("express");
var app = express();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var multer = require('multer'),
  bodyParser = require('body-parser'),
  path = require('path');
var mongoose = require("mongoose");
mongoose.connect("mongodb+srv://smishra4:sHDP9aIkqokUqmf7@cluster0.rq6orye.mongodb.net/Project1?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
var fs = require('fs');
var product = require("./model/product.js");
var user = require("./model/user.js");

//firebase stuff
const {
  ref,
  uploadBytes,
  listAll,
  deleteObject,
  getDownloadURL
} = require("firebase/storage");
const storage = require("./firebase");
const memoStorage = multer.memoryStorage();
const upload = multer({ memoStorage });

app.use(cors());
app.use(express.static('uploads'));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: false
}));

app.use("/", (req, res, next) => {
  try {
    if (req.path == "/login" || req.path == "/register" || req.path == "/") {
      next();
    } else {
      /* decode jwt token if authorized*/
      jwt.verify(req.headers.token, 'shhhhh11111', function (err, decoded) {
        if (decoded && decoded.user) {
          req.user = decoded;
          next();
        } else {
          return res.status(401).json({
            errorMessage: 'User unauthorized!',
            status: false
          });
        }
      })
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
})

app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    title: 'Apis'
  });
});

//firebase api calls
app.post("/addPicture", upload.single("pic"), async (req, res) => {
  const file = req.file;
  const imageRef = ref(storage, file.originalname);
  const metatype = { contentType: file.mimetype, name: file.originalname };
  await uploadBytes(imageRef, file.buffer, metatype)
    .then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        res.send(url);
      })
    })
    .catch((error) => console.log(error.message));
});

/* login api */
app.post("/login", (req, res) => {
  try {
    console.log(req.body.email);
    if (req.body && req.body.email && req.body.password) {
      user.find({ email: req.body.email }, (err, data) => {
        if (data.length > 0) {
          console.log(JSON.stringify(data));
          if (bcrypt.compareSync(data[0].password, req.body.password)) {
            checkUserAndGenerateToken(data[0], req, res);
          } else {

            res.status(400).json({
              errorMessage: 'Email or password is incorrect!',
              status: false
            });
          }

        } else {
          res.status(400).json({
            errorMessage: 'Email or password is incorrect!',
            status: false
          });
        }
      })
    } else {
      res.status(400).json({
        errorMessage: 'Wrong credentials!!!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }

});

/* register api */
app.post("/register", (req, res) => {
  try {
    if (req.body && req.body.email && req.body.password) {

      user.find({ email: req.body.email }, (err, data) => {

        if (data.length == 0) {
          console.log(JSON.stringify(req.body));
          let User = new user({
            F_name: req.body.F_name,
            L_name: req.body.L_name,
            email: req.body.email,
            password: req.body.password
          });
          console.log(User);
          User.save((err, data) => {
            if (err) {
              res.status(400).json({
                errorMessage: err,
                status: false
              });
            } else {
              res.status(200).json({
                status: true,
                title: 'Registered Successfully.'
              });
            }
          });

        } else {
          res.status(400).json({
            errorMessage: `UserName ${req.body.email} Already Exist!`,
            status: false
          });
        }

      });

    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

function checkUserAndGenerateToken(data, req, res) {
  jwt.sign({ user: data.email, id: data._id }, 'shhhhh11111', { expiresIn: '1d' }, (err, token) => {
    if (err) {
      res.status(400).json({
        status: false,
        errorMessage: err,
      });
    } else {
      res.json({
        message: 'Login Successfully.',
        token: token,
        status: true,
        info: data
      });
    }
  });
}

/* Api to add Product */
app.post("/add-product", upload.any(), (req, res) => {
  try {
    console.log(req.body.date_aq);
    if (req.body && req.body.name && req.body.desc && req.body.approx_v &&
      req.body.ins_v && req.body.date_aq && req.body.image) {
      console.log(JSON.stringify(req.body, 5, null))
      let newProduct = new product();
      newProduct.name = req.body.name;
      newProduct.desc = req.body.desc;
      newProduct.approx_v = req.body.approx_v;
      newProduct.image = req.body.image;
      newProduct.ins_v = req.body.ins_v;
      newProduct.date_aq = req.body.date_aq;
      newProduct.user_id = req.user.id;
      newProduct.save((err, data) => {
        if (err) {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        } else {
          res.status(200).json({
            status: true,
            title: 'Product Added successfully.'
          });
        }
      });

    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

/* Api to update Product */
app.post("/update-product", upload.any(), (req, res) => {
  try {
    if (req.body && req.body.name && req.body.desc && req.body.approx_v &&
      req.body.id && req.body.ins_v && req.body.date_aq) {

      product.findById(req.body.id, (err, newProduct) => {
        if (req.body && req.body.name && req.body.desc && req.body.approx_v &&
          req.body.ins_v && req.body.date_aq && req.body.image)
          {
            newProduct.name = req.body.name;
            newProduct.desc = req.body.desc;
            newProduct.approx_v = req.body.approx_v;
            newProduct.ins_v = req.body.ins_v;
            newProduct.date_aq = req.body.date_aq;
            newProduct.image = req.body.image;
          }
        newProduct.save((err, data) => {
          if (err) {
            res.status(400).json({
              errorMessage: err,
              status: false
            });
          } else {
            res.status(200).json({
              status: true,
              title: 'Product updated.'
            });
          }
        });

      });

    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

/* Api to delete Product */
app.post("/delete-product", (req, res) => {
  try {
    if (req.body && req.body.id) {
      product.findByIdAndUpdate(req.body.id, { is_delete: true }, { new: true }, (err, data) => {
        if (data.is_delete) {
          res.status(200).json({
            status: true,
            title: 'Product deleted.'
          });
        } else {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        }
      });
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

/*Api to get and search product with pagination and search by name*/
app.get("/get-product", (req, res) => {
  try {
    var query = {};
    query["$and"] = [];
    query["$and"].push({
      is_delete: false,
      user_id: req.user.id
    });
    if (req.query && req.query.search) {
      query["$and"].push({
        name: { $regex: req.query.search }
      });
    }
    var perPage = 20;
    var page = req.query.page || 1;
    product.find(query, { date_aq: 1, name: 1, id: 1, desc: 1, image: 1, ins_v: 1, approx_v: 1 })
      .skip((perPage * page) - perPage).limit(perPage)
      .then((data) => {
        product.find(query).count()
          .then((count) => {
            console.log(data)
            if (data && data.length > 0) {
              res.status(200).json({
                status: true,
                title: 'Product retrived.',
                products: data,
                current_page: page,
                total: count,
                pages: Math.ceil(count / perPage),
              });
            } else {
              res.status(400).json({
                errorMessage: 'There is no product!',
                status: false
              });
            }

          });

      }).catch(err => {
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }

});

app.listen(2000, () => {
  console.log("Server is Runing On port 2000");
});
