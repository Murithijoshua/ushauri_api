const express = require("express");
const router = express.Router();
const request = require('request');
const https = require('https');
const moment = require("moment");
const base64 = require("base64util");
require("dotenv").config();
//var mysql = require("mysql");
const mysql = require('mysql2');
// { Op } = require("sequelize");

const {
  Napptreschedule
} = require("../../models/n_appoint_reschedule");




//Calendar
router.get('/calender', (req, res) => {
    const vFrom = req.query.start;
    const vTo = req.query.end;
    const vTelephone=req.query.telephone;

   // console.log(vTelephone)

    try{

        const conn = mysql.createPool({
            connectionLimit: 10,
            host: process.env.DB_SERVER,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            debug: true,
            multipleStatements: true,
          });
          
         let  sql = `CALL sp_appointmentcalendar(?,?,?)`;
         let todo = [vFrom,vTo, vTelephone];
          conn.query(sql,todo, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
                conn.end();

              }
              //console.log(results[0]);

              res.send(results[0]);
         
            // conn.query("CALL sp_appointmentcalendar("++")",{vTelephone}, (error, data) => {
            //if (error) {
             // console.log(error)
             // conn.end();
             // return;
           // }
          
            //console.log(results[0]);
          conn.end();
          });
    
       
   

    }catch(err){

    }


  });


  router.get('/applist', (req, res) => {
    const vFrom = req.query.start;
   // const vTo = req.query.end;
    const vTelephone=req.query.telephone;

    //console.log(vTelephone)

    try{

        const conn = mysql.createPool({
            connectionLimit: 10,
            host: process.env.DB_SERVER,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            debug: true,
            multipleStatements: true,
          });
          
         let  sql = `CALL sp_appointmentcalendar_list(?,?)`;
         let todo = [vFrom, vTelephone];
          conn.query(sql,todo, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
                conn.end();

              }
              //console.log(results[0]);

              res.send(results[0]);
         
           
            conn.end();
          });
    
       
   

    }catch(err){

    }


  });


  router.get('/reschedule_list', (req, res) => {
    //const vFrom = req.query.start;
   // const vTo = req.query.end;
    const vTelephone=req.query.telephone;

    //console.log(vTelephone)

    try{

        const conn = mysql.createPool({
            connectionLimit: 10,
            host: process.env.DB_SERVER,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            debug: true,
            multipleStatements: true,
          });
          
         let  sql = `CALL sp_reschedule_list(?)`;
         let todo = [vTelephone];
          conn.query(sql,todo, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
                conn.end();

              }
              //console.log(results[0]);

              res.send(results[0]);
         
           
            conn.end();
          });
    
       
   

    }catch(err){

    }


  });


  router.post('/updatereschedule', async(req, res) =>  {
  
    let reschedule_id = req.body.r_id;
    let approval_status = req.body.r_status;
    //let proposed_date_ = req.body.reschedule_date;
    let today = moment(new Date().toDateString()).tz("Africa/Nairobi").format("YYYY-MM-DD H:M:S");
    
    
    //Check if we already have an existing reschedule request
  
     //Search if Program Details Exist
     let check_reschedule_request_exists= await Napptreschedule.findOne({
      where: {
        [Op.and]: [
          { id: reschedule_id},
          { status: '0'} // Check if exists and is pending
        ]
      }
    });
    if(!check_reschedule_request_exists)
    {

      Napptreschedule.update(
        {  status:approval_status, process_date:today, updated_at:today
      },
        { returning: true, where: { id: reschedule_id} }
      )
        .then(() => {
          return res
          .status(200)
          .json({
              success: true,
              msg: 'Reschedule request processed successfully. ',
          });
        })
        .catch(err => {
          return res
          .status(200)
          .json({
              success: false,
              msg: 'Appointment Reschedule Request Record Already Exist',
          });
        });
  
    }
        
      
     
  });


  module.exports = router;
