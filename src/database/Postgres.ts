import 'dotenv/config'
import { Sequelize } from "sequelize";
import { FatalError } from '../Errors/FatalError';

const {
  DATABASE_NAME,
  DATABASE_USER = 'postgres',
  DATABASE_PASSWORD = 'postgres',
  DATABASE_HOST = 'localhost',
  DATABASE_PORT = 5432
} = process.env;

if (! DATABASE_NAME) {
  throw new FatalError('Database name is missing in ENV')
}

const Postgres = new Sequelize(
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  {
    dialect: 'postgres',
    host: DATABASE_HOST,
    port: +DATABASE_PORT,
    // logging: false
  }
)

export default Postgres;