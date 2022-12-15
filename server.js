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
var category = require("./model/category");
var inventory = require("./model/inventory");
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

app.use("/api", (req, res, next) => {
  try {
    if (req.path == "/login" || req.path == "/register" || req.path == "/" || req.path == '/getProducts' || 
        req.path == '/getCategories' || req.path === '/add-product' || req.path == '/addPicture' || req.path == '/get-inventory') {
      next();
    } else {
      /* decode jwt token if authorized*/
      jwt.verify(req.headers.token, 'project1620', function (err, decoded) {
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

app.get("/api", (req, res) => {
  res.status(200).json({
    status: true,
    title: 'Apis'
  });
});

//firebase api calls
app.post("/api/addPicture", upload.single("pic"), async (req, res) => {
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
app.post("/api/login", (req, res) => {
  try {
    if (req.body && req.body.email && req.body.password) {
      user.find({ email: req.body.email }, (err, data) => {
        if (data.length > 0) {
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

//Api to get user info
app.get("/api/user-info", (req,res) => {
  try {
    var query = {};
    query["$and"] = [];
    query["$and"].push({
      _id: req.user.id
    });
    user.findOne(query , (err, data) => {
      if(data)
      {
        res.status(200).json({name: `${data.F_name} ${data.L_name}` , email: data.email, role: data.role})
      }
      else{
        res.status(200).json({err: "Couldn't find details"})
      }
    })
  } catch (error) {
    
  }
})

/* register api */
app.post("/api/register", (req, res) => {
  try {
    if (req.body && req.body.email && req.body.password) {

      user.find({ email: req.body.email }, (err, data) => {

        if (data.length == 0) {
          let User = new user({
            F_name: req.body.F_name,
            L_name: req.body.L_name,
            email: req.body.email,
            password: req.body.password
          });
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
            errorMessage: `UserName ${req.body.email} Already Exists!!`,
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
  jwt.sign({ user: data.email, id: data._id }, 'project1620', { expiresIn: '1d' }, (err, token) => {
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

//pi to add inventory/product
app.post("/api/add-product", upload.any(), (req, res) => {
  try {
    if (req.body && req.body.name && req.body.desc && req.body.approx_v &&
      req.body.ins_v && req.body.date_aq && req.body.category && req.body.image) {
      let newProduct = new product();
      newProduct.name = req.body.name;
      newProduct.desc = req.body.desc;
      newProduct.approx_v = req.body.approx_v;
      newProduct.image = req.body.image;
      newProduct.ins_v = req.body.ins_v;
      newProduct.category = req.body.category;
      newProduct.date_aq = req.body.date_aq;
      newProduct.save((err, data) => {
        if (err) {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        } else {
          res.status(200).json({
            status: true,
            title: 'Inventory Added successfully.'
          });
        }
      });

    } else {
      res.status(400).json({
        errorMessage: 'Some fields are missing!!',
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

//Api to update Product
app.post("/api/product-update", upload.any(), (req, res) => {
  try {
    if (req.body && req.body.name && req.body.desc && req.body.approx_v &&
      req.body.id && req.body.ins_v && req.body.date_aq) {

      product.findById(req.body.id, (err, newProduct) => {
        if (req.body && req.body.name && req.body.desc && req.body.approx_v &&
          req.body.ins_v && req.body.date_aq && req.body.image) {
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
        errorMessage: 'Some fields are missing!!',
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
app.post("/api/delete-product", (req, res) => {
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
app.get("/api/get-product", (req, res) => {
  try {
    var query = {};
    query["$and"] = [];
    query["$and"].push({
      is_delete: false
    });
    if (req.query && req.query.search) {
      var regexp = new RegExp(req.query.search);
      query["$and"].push({
        name: { $regex: regexp }
      });
    }
    console.log(req.query.search)
    var perPage = 20;
    var page = req.query.page || 1;
    product.find(query, { date_aq: 1, name: 1, id: 1, desc: 1, image: 1, ins_v: 1, approx_v: 1, category: 1 })
      .skip((perPage * page) - perPage).limit(perPage)
      .then((data) => {
        product.find(query).countDocuments()
          .then((count) => {
            if (data && data.length > 0) {
              res.status(200).json({
                status: true,
                title: 'Products retrived.',
                products: data,
                current_page: page,
                total: count,
                pages: Math.ceil(count / perPage),
              });
            } else {
              res.status(200).json({
                errorMessage: 'There is no Products in the database!',
                status: false,
                products: []
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
/*Api to get product count*/
app.get("/api/get-product-count", (req, res) => {
  try {
    product.collection.count()
      .then((data) => {
        res.status(200).json({ count: data })
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
/*Api to get category count*/
app.get("/api/get-category-count", (req, res) => {
  try {
    category.collection.count()
      .then((data) => {
        res.status(200).json({ count: data })
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
//api to add category
app.post("/api/add-category", upload.any(), (req, res) => {
  try {
    console.log(req.body)
    if (req.body && req.body.name && req.body.desc) {
      let newCategory = new category();
      newCategory.name = req.body.name;
      newCategory.description = req.body.desc;
      newCategory.save((err, data) => {
        if (err) {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        } else {
          res.status(200).json({
            status: true,
            title: 'Category Added successfully.'
          });
        }
      });

    } else {
      res.status(400).json({
        errorMessage: 'Some fields are missing!!',
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

//Api to update category
app.post("/api/update-category", upload.any(), (req, res) => {
  try {
    if (req.body && req.body.name && req.body.desc) {

      category.findById(req.body.id, (err, newCategory) => {
        if (req.body && req.body.name && req.body.desc) {
          newCategory.name = req.body.name;
          newCategory.description = req.body.desc;
        }
        newCategory.save((err, data) => {
          if (err) {
            res.status(400).json({
              errorMessage: err,
              status: false
            });
          } else {
            res.status(200).json({
              status: true,
              title: 'Category updated.'
            });
          }
        });

      });

    } else {
      res.status(400).json({
        errorMessage: 'Some fields are missing!!',
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

/* Api to delete category */
app.post("/api/delete-category", (req, res) => {
  try {
    if (req.body && req.body.id) {
      category.findByIdAndUpdate(req.body.id, { is_delete: true }, { new: true }, (err, data) => {
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
app.get("/api/get-category", (req, res) => {
  try {
    var query = {};
    query["$and"] = [];
    query["$and"].push({
      is_delete: false
    });
    if (req.query && req.query.search) {
      query["$and"].push({
        name: { $regex: req.query.search }
      });
    }
    var perPage = 20;
    var page = req.query.page || 1;
    category.find(query, { name: 1, id: 1, description: 1 })
      .skip((perPage * page) - perPage).limit(perPage)
      .then((data) => {
        category.find(query).count()
          .then((count) => {
            if (data && data.length > 0) {
              res.status(200).json({
                status: true,
                title: 'Category retrived.',
                category: data,
                current_page: page,
                total: count,
                pages: Math.ceil(count / perPage),
              });
            } else {
              res.status(400).json({
                errorMessage: 'There is no category.',
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

const aggregate = (data) => {
  const nameMapping = data.reduce((prev, current) => {
    prev[current['p_id']] = current['p_name']
    return prev
  }, {})
  const countData = data.reduce((prev, current) => {
    if (current['p_id'] in prev) {
      if (current['type'] === 'In')
        prev[current['p_id']] += parseInt(current['count'])
      else
        prev[current['p_id']] -= parseInt(current['count'])
    } else {
      prev[current['p_id']] = current['type'] === 'In' ? parseInt(current['count']) : -parseInt(current['count'])
    }
    return prev
  }, {})
  return Object.keys(countData).map(key => ({
    name: nameMapping[key],
    count: countData[key],
    id: key
  }))
}
//Api to fetch all products
app.get("/api/getProducts", (req, res) => {
  product.find({is_delete: false}).then((data) => {
    if (data && data.length > 0) {
      res.status(200).json({ products: data });
    }
    else {
      res.status(200).json({});
    }
  })
})

//Api to fetch all categories
app.get("/api/getCategories", (req, res) => {
  category.find().then((data) => {
    if (data && data.length > 0) {
      res.status(200).json({ categories: data });
    }
    else {
      res.status(200).json({ categories: []});
    }
  })
})

//Api to add inventory
app.post("/api/add-inventory", upload.any(), async (req, res) => {
  try {
    if (req.body && req.body.p_id && req.body.count && req.body.type) {
      let newInventory = new inventory();
      let p_name = '';
      await product.findById(req.body.p_id).then((data) => p_name = data.name)
      newInventory.p_id = req.body.p_id;
      newInventory.count = req.body.count;
      newInventory.type = req.body.type;
      newInventory.p_name = p_name;
      newInventory.user_id = req.user.id;
      newInventory.save((err, data) => {
        if (err) {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        } else {
          res.status(200).json({
            status: true,
            title: 'Inventory Added successfully.'
          });
        }
      });

    } else {
      res.status(400).json({
        errorMessage: 'Some fields are missing!!',
        status: false
      });
    }
  } catch (e) {
    console.log(e)
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

//Api to get product details
app.get("/api/get-product-details/:pid", async (req, res) => {
  try {
    var query = {};
    query["$and"] = [];
    query["$and"].push({
      is_delete: false,
      user_id: req.user.id,
      p_id: req.params.pid
    });
    const productInfo = await product.findOne({ _id: req.params.pid })
    inventory.find(query).then((response) => {
      if (response && response.length > 0) {
        res.status(200).json({
          details: productInfo,
          stockHistory: response
        })
      }
      else {
        res.status(200).json({
          details: productInfo,
          stockHistory: []
        })
      }

    })
  } catch (e) {
    console.log(e)
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
})

/*Api to get and search inventory with pagination and search by name*/
app.get("/api/get-inventory", (req, res) => {
  try {
    var query = {};
    query["$and"] = [];
    query["$and"].push({
      is_delete: false,
    });
    if (req.query && req.query.search) {
      query["$and"].push({
        name: { $regex: req.query.search }
      });
    }
    // {name:count}
    var perPage = 20;
    var page = req.query.page || 1;
    inventory.find(query)
      .skip((perPage * page) - perPage).limit(perPage)
      .then((data) => {
        product.find({ is_delete: false }).count()
          .then((count) => {
            if (data && data.length > 0) {
              console.log(count)
              res.status(200).json({
                status: true,
                title: 'Inventory retrived.',
                inventory: aggregate(data),
                current_page: page,
                total: count,
                pages: Math.ceil(count / perPage),
              });
            } else {
              res.status(200).json({
                errorMessage: 'There is no Inventory for the user!',
                status: false,
                inventory: [],
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
    console.log(e)
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }

});
app.listen(2000, () => {
  console.log("Server is Runing On port 2000");
});
