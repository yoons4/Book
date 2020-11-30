let express = require('express')
let router = express.Router()
let BookSchema = require('../models/books.js')

function HandleError(response, reason, message, code){
    console.log("Error: " + reason)
    response.status(code || 508).json({"error:":message});

}

router.post('/', (request, response, next) =>{
    let newBook = request.body;

    if(!newBook.Name || !newBook.Author || !newBook.ISBN || !newBook.Price){
        HandleError(response, 'Missing info', 'Form Data missing', 500);
    } else{
        let countSymbol = 0;
        let countNumber = 0;
        for(var i = 0; i < (newBook.ISBN).length; i++){
            if(newBook.ISBN[i] === '-'){
                countSymbol++;
            }
            else{
                countNumber++;
            }
        }

        if(countSymbol != 4 || countNumber != 13){
            HandleError(response, 'Invalid ISBN', 'ISBN is not valid.', 500);
        }
        else{
            let book = new BookSchema({
                Name: newBook.Name,
                Author: newBook.Author,
                ISBN: newBook.ISBN,
                Price: newBook.Price
            });
            book.save((error) =>{
                if(error){
                    response.send({"Error": error});
                }else{
                    response.send({"id": book.id});
                }
            });
        }
    }
});

router.get('/', (request, response, next) =>{
    let author = request.query['author'];
    if(author){
        BookSchema
            .find({"Author": author})
            .exec((error, books) =>{
                if(error){
                    response.send({"error": error});
                }else{
                    response.send(books);
                }
            });
    }else{
        BookSchema
            .find()
            .exec((error, books) =>{
                if(error){
                    response.send({"error": error});
                }else{
                    response.send(books);
                }
            });
    }
});

router.get('/:isbn', (request, response, next) =>{
        BookSchema
            .findOne({"ISBN": request.params.isbn}, (error, result) =>{
                if(error){
                    response.status(500).send(error);
                }

                if(result){
                    response.send(result);
                }else{
                    response.status(404).send({"ISBN": request.params.isbn, "error": "Not found"});
                }
            })
    }

);

// query param = isbn, author, name, etc
//
router.patch('/:isbn', (request, response, next) =>{
    BookSchema
        .findOne({"ISBN": request.params.isbn}, (error, result)=>{
            if (error) {
                response.status(500).send(error);
            }

            if (result){
                if (request.body.isbn){
                    delete request.body.isbn;
                }
                for (let field in request.body){
                    result[field] = request.body[field];
                }
                result.save((error, books)=>{
                    if (error){
                        response.status(500).send(error);
                    }
                    response.send(books);
                });
            }else{
                response.status(404).send({"id": request.params.ISBN, "error":  "Not Found"});
            }

        });
});

router.delete('/:isbn', (request, response, next) =>{
    BookSchema
        .findOne({"ISBN": request.params.isbn}, (error, result) =>{
            if(error){
                response.status(500).send(error);
            }

            if(result){
                result.remove((error)=>{
                    if (error){
                        response.status(500).send(error);
                    }
                    response.send({"deletedISBN": request.params.isbn});
                });
            }else{
                response.status(404).send({"ISBN": request.params.isbn, "error": "Not found"});
            }
        })
});

module.exports = router;
