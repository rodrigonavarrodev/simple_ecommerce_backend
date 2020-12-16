const express = require('express')
const cookieParser = require('cookie-parser')

const app = express()
const mongoose = require('mongoose')

const { User } = require('./models/user')
const { Brand } = require('./models/brand')
const { Category } = require('./models/category')

const { admin } = require('./middleware/admin')
const { auth } = require('./middleware/auth')
const { Product } = require('./models/product')

require('dotenv').config()

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true }, (err) => {
    if(err) return err
    console.log('Conectado a MongoDB')
})

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())

const port = process.env.PORT || 3002

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`)
})


//::::::::::::: RUTAS :::::::::::::


//::::::::::::: RESGISTRO :::::::::::::
app.post('/api/users/register', (req, res) => {
    const user = new User(req.body)
    user.save((err, doc) => {
        if(err) return res.json({success: false, err})
        res.status(200).json({
            success: true,
            userdata: doc
        })
    })
})

//::::::::::::: LOGIN :::::::::::::
app.post('/api/users/login', (req, res) => {
    // 1. Encontrar el correo en la BD
    User.findOne({'email': req.body.email}, (err, user) => {
        if(!user) return res.json({loginSuccess: false, messafe: 'Login fallido, mail incorrecto'})
    // 2. Obtener password y validarlo con el de la BD
    user.comparePassword(req.body.password, (err, isMatch) => {
        if(!isMatch) return res.json({loginSuccess: false, message: 'Contraseña incorrecta'})
    // 3. Si todo es correcto, genera un Token
    user.generateToken((err, user) => {
        if(err) return res.status(400).send(err)
    // 4. Si todo es correcto, guardamos el token como un cookie
    res.cookie('deporshop_auth', user.token).status(200).json(
        {loginSuccess: true}
    )
            })  
        })
    })
})

//::::::::::::: AUTH :::::::::::::
app.get('/api/users/auth', auth, (req, res) => {
    res.status(200).json({
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        cart: req.user.cart,
        history: req.user.history
    })
})


//::::::::::::: LOGOUT :::::::::::::
app.get('/api/users/logout', auth,(req, res) => {
    User.findOneAndUpdate(
        {_id: req.user._id},
        {token: ''},
        (err, doc)=>{
            if(err) return res.json({success: false, err})
            return res.status(200).json({success:true})
        })
})


//::::::::::::: CREAR UNA MARCA ROL ADMIN :::::::::::::
app.post('/api/product/brand', auth, admin, (req, res) => {
    const brand = new Brand(req.body)
    brand.save((err, doc) => {
        if(err) return res.json({success: false, err})
        res.status(200).json({
            success: true,
            brand: doc
        })
    })
})


//::::::::::::: VER MARCAS :::::::::::::
app.get('/api/product/brands', (req, res) => {
    Brand.find({}, (err, brands) => {
        if(err) return res.status(400).send(err)
        res.status(200).send(brands)
    })
})


//::::::::::::: CREAR CATEGORIA :::::::::::::
app.post('/api/product/category', auth, admin, (req, res) => {
    const category = new Category(req.body)
    category.save((err, doc) => {
        if(err) return res.json({success: false, err})
        res.status(200).json({
            success: true,
            category: doc
        })
    })
})


//::::::::::::: VER TODAS LAS CATEGORIAS :::::::::::::
app.get('/api/product/categories', (req, res) => {
    Category.find({}, (err, categories) => {
        if(err) return res.status(400).send(err)
        res.status(200).send(categories)
    })
})


//::::::::::::: CREAR PRODUCTO :::::::::::::
app.post('/api/product/article', auth, admin, (req, res) => {
    const product = new Product(req.body)
    product.save((err, doc) => {
        if(err) return res.json({success: false, err})
        res.status(200).json({
            success: true,
            article: doc
        })
    })
})


//::::::::::::: BUSCAR PRODUCTO POR ID :::::::::::::
app.get('/api/product/articles_by_id', ( req, res ) => {     
    let type = req.query.type    
    let items = req.query.id         
    if(type === "array"){         
        let ids = req.query.id.split(',')         
        items = []         
        items = ids.map(item => {              
    // Convertirlos en ObjectId de Mongoose            
    return mongoose.Types.ObjectId(item)         
            })
        }
    Product
        .find({ '_id': {$in:items}})
        .populate("brand")
        .populate("category")
        .exec((err, docs)=> {
    return res.status(200).send(docs)     
        }) 
    })

//::::::::::::: BUSCAR ULTIMOS PRODUCTOS CREADOS Y MAS VENDIDOS :::::::::::::
app.get('/api/product/articles', (req, res) => {     
    let order = req.query.order ? req.query.order : 'asc'    
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id'     
    let limit = req.query.limit ? parseInt(req.query.limit) : 100         
    Product
        .find()
        .populate('brand')
        .populate('category')
        .sort([[sortBy, order]])
        .limit(limit)
        .exec((err, articles) => {
            if(err) return res.status(400).send(err)
            res.send(articles)     
        }) 
    })