import { Sequelize } from 'sequelize';

// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize(process.env.DB_NAME as string, process.env.DB_USER as string, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    // convert process.env.DB_PORT from string to number (e.g., using parseInt 
    // or Number) before passing it to Sequelize.
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
    dialect: 'postgres'
  });

(async () => {
    try {
        // Initiates connection to database from your code; it's a bridge between API Server and database 
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}) ();

 // export sequelize
 export default sequelize;














//  import { Sequelize } from 'sequelize';

// // Option 3: Passing parameters separately (other dialects)
// const sequelize = new Sequelize(process.env.DB_NAME as string, process.env.DB_USER as string, process.env.DB_PASSWORD, {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: 'postgres'
//   });

// (async () => {
//     try {
//         // Initiates connection to database from your code; it's a bridge between API Server and database 
//         await sequelize.authenticate();
//         console.log('Connection has been established successfully.');
//       } catch (error) {
//         console.error('Unable to connect to the database:', error);
//       }
// }) ();

//  // export sequelize
//  export default sequelize;