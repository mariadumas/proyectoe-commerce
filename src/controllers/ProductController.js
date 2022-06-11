const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator"); // requerimos para poder validar errores

const productsFilePath = path.join(__dirname, "../data/products.json");
const carritoFilePath = path.join(__dirname, "../data/cart.json");
// let productJSON = fs.readFileSync(productsFilePath, 'utf-8');
// let libros = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

const productController = {
	cart: function (req, res) {
		let librosCarrito = JSON.parse(fs.readFileSync(carritoFilePath, "utf-8"));
		return res.render("products/cart", {
			hoja: "productStyles.css",
			title: "Mis libros",
			carrito: librosCarrito,
		});
	},

	create: function (req, res) {
		return res.render("products/create", {
			hoja: "productStyles.css",
			title: "Crear producto",
		});
	},

	save: (req, res) => {
		let errors = validationResult(req); //guarda validacion errores

		console.log(errors);
		let libros = JSON.parse(fs.readFileSync(productsFilePath, "utf-8"));

		let ultimo = libros.length - 1;
		let idnuevo = libros[ultimo].id + 1;
		if (errors.isEmpty()) {
			//bloque que valida si errors esta vacio
			let newProduct = {
				id: idnuevo,
				titulo: req.body.titulo,
				autor: req.body.autor,
				editorial: req.body.editorial,
				isbn: req.body.isbn,
				precio: req.body.precio,
				categoria: req.body.categoria,
				descripcion: req.body.descripcion,
				cantidad: req.body.cantidad,
				paginas: req.body.paginas,
				imagen: req.file.filename,
			};
			// Tengo que guardar esta info en algún lado

			// Primero leer lo que ya había en el archivo json
			let productJSON = fs.readFileSync(productsFilePath, {
				encoding: "utf-8",
			});

			let productos;

			if (productJSON == "") {
				productos = [];
			} else {
				productos = JSON.parse(productJSON);
			}
			productos.push(newProduct);

			let productosJSON = JSON.stringify(productos, null, "\t");

			fs.writeFileSync(productsFilePath, productosJSON);

			res.redirect("/"); //Funciona bien cuando se selecciona la categoría Primaria, pero al seleccionar Secundaria hay que actualizar para que carguen las imágenes en el Home. Pendiente para solucionar.
		}else{
			res.render('products/create',{errors:errors.array(), old:req.body, title:"Crear Producto"})  //enviamos a la vista array con errores , y old envia datos validos para no volver a completarlos
	
		}
	},

	edit: function (req, res) {
		let libros = JSON.parse(fs.readFileSync(productsFilePath, "utf-8"));

		let productID = req.params.id;

		const product = libros.find((item) => item.id == req.params.id);
		res.render("products/edit", { libroEditar: product, title: libros.titulo });

		//const libroEditar = books[productID];
		// res.render("products/edit",{hoja:'productStyles.css',libroEditar:libroEditar})
	},

	update: (req, res) => {
		let libros = JSON.parse(fs.readFileSync(productsFilePath, "utf-8"));

		libros.find((libro) => {
			if (libro.id == req.params.id) {
				(libro.titulo = req.body.titulo),
					(libro.autor = req.body.autor),
					(libro.descripcion = req.body.descripcion);
				if (req.file != undefined) {
					libro.imagen = req.file.filename;
				}
			}
		});
		fs.writeFileSync(productsFilePath, JSON.stringify(libros, null, "\t"));
		//fs.readFileSync(productsFilePath,'UTF-8');

		res.redirect("/products/detail/" + req.params.id); //Funciona bien el método pero hay que volver a cargar la imagen cada vez que se edita. Buscar solución.
	},

	detail: function (req, res) {
		let libros = JSON.parse(fs.readFileSync(productsFilePath, "utf-8"));

		//	let nombreTitulo;
		//  let libro = libros.find(libro=>{
		//   if (libro.id == req.params.id){
		//		nombreTitulo = req.params.titulo;
		//	}
		//  })
		//    res.render("products/detail", {libro: libro, title: nombreTitulo})

		//jungle.find(el => el.threat == 5));

		const product = libros.find((item) => item.id == req.params.id);

		res.render("products/detail", {
			libroEditar: product,
			libros: libros,
			title: libros.titulo,
		}); // No actualiza la variable, hay que parar el servidor y volver a correrlo para actualizar variable y  ver la vista
		//otra opcion redigir al home como el destroy
	},
	list:(req,res)=>{

		let libros = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
	
   
	res.render("products/productsList",{libros: libros, title: "Lista de libros",hoja:'style.css'});
	   },


	//** */

	destroy: (req, res) => {
		let libros = JSON.parse(fs.readFileSync(productsFilePath, "utf-8"));

		//const productoToDelete=products.find(product=>product.id===parseInt(req.params.id));
		let newListProducts = libros.filter(
			(product) => product.id !== parseInt(req.params.id)
		);
		// products = newListProducts; Al comentar estea línea y pasarle con let la variable newListProducts, se arregla el bug de que no cargaban las imágenes al redirigir al Home.
		fs.writeFileSync(
			productsFilePath,
			JSON.stringify(newListProducts, null, "\t")
		);
		res.redirect("/");
	},
};

module.exports = productController;
