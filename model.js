const dotenv = require('dotenv');
dotenv.config();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');


const neo4j = require("neo4j-driver"); 
const { response } = require('express');

const url=process.env.dbUrl
const username=process.env.dbUsername
const password=process.env.dbPassword

const driver = neo4j.driver(url, neo4j.auth.basic(username,password ),{ disableLosslessIntegers: true });

const session = driver.session(); 

const getAllBook = async () => {
    const result = await session.run(`MATCH (n) RETURN n`);
    return result.records.map(record => record.get('n').properties);
}

const getBookByName = async (name) => {
    const result = await session.run(`MATCH (n) WHERE n.name ='${name}' RETURN n`);
    // return result.records[0].properties;
    return result.records.map(record => record.get('n').properties)
}

const addBook = async (book,res) => {
    const result = await session.run(`CREATE(var:BOOK {author:'${book.author}',category:'${book.category}',discount:'${book.discount}%',name:'${book.name}',price:'${book.price}Rs.',description:'${book.description}',key:'${book.key}'}) RETURN var`);
    // return result.records[0].properties;
    res.json('added') 
}     

const editBookDetails = async (book) => {
    await session.run(`MATCH (var) WHERE var.name='${book.name}' AND var.author='${book.author}'  SET var.author='${book.author}',var.category='${book.category}',var.discount='${book.discount}%',var.name='${book.name}',var.published='${book.published}',price:'${book.price}Rs.' RETURN var`);
    // return await getAllBook();   
    // return result.records[0].properties;
}

const deleteBook = async (book) => {
    await session.run(`MATCH (var) WHERE var.name='${book.name}' AND var.author='${book.author}' DETACH  DELETE var`);
    // return await getAllBook(); 
}    
    
///-----------------------------------------------------------------------------------------

const tokenData = async (userDetails,res) => {
    console.log("in token")
    // getting all data
    const { name, email, password } = userDetails;
    

    // checking that we got all data
    if (!(name && email && password)) {
        res.status(400).send('data is missing');
    }

    // checking for existing data
    const exists = await session.run(`MATCH (var:User) WHERE var.email='${email}' RETURN var`);
    console.log("00000000000000", exists.records.map(record => record.get('var').properties),3111111111111111111)
    if (exists.records.length>0) {

        res.json('user already exists'); 
        return
    }
    //hashing password
    const encPass = await bcrypt.hash(password, 10);
    const uniquekey=uuidv4()
    const result = await session.run(`CREATE (var:User {name:'${name}', email:'${email}', password:'${encPass}' ,key:'${uniquekey}'}) RETURN var`);
    res.json('registered')
    
    // const id = result.records[0].get('var').properties;
    // const token = jwt.sign({ name, email }, "secretpass");
    // console.log(token, id);
    // // return { id, token };
};
////-------------------------------------------------------------------------------
const loggedin =async(userDetails,res)=>{
    const { email, password } = userDetails;
    if (!(email && password)) {
        res.status(400).send('data is missing');
    }

    const result = await session.run(`MATCH(N:User) WHERE N.email= '${email}' RETURN N`)
        const exists=!result.records.length
        if(exists){
            res.json('user not exists');
        } 
    /// checking details
        const hashedPassword=result.records[0].get('N').properties.password
        const key=result.records[0].get('N').properties.key

        const matched=await bcrypt.compare(password,hashedPassword)
        const val={
            "matched":true,
            "key":key
        }
        if(matched){
            res.send(val) 
        }else{
            res.send("false")
        }
        
 


}

module.exports = { getAllBook ,getBookByName,addBook,editBookDetails,deleteBook,tokenData,loggedin};
