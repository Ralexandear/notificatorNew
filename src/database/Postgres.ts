import { Sequelize } from "sequelize";
const ENV = process.env;

[
    ENV.DB_NAME,
    ENV.DB_PASSWORD,
    ENV.DB_USER,
    ENV.DB_HOST,
].forEach(e => {
    console.log(e)
    if (! e || typeof e !== 'string') {
        throw new Error('One of required parameters is missing in env file')
    }
});

const Postgres = new Sequelize(
  ENV.DB_NAME as string,
  ENV.DB_USER as string,
  ENV.DB_PASSWORD as string,
  {
    dialect: 'postgres',
    host: ENV.DB_HOST,
    port: Number(ENV.DB_PORT) || 5432,
    // logging: false
  }
)

export default Postgres;