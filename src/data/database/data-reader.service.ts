import { IData } from '../../types/data.interface';
import * as fs from 'fs';

export const Data: IData = JSON.parse(
    fs.readFileSync('./src/data/database/data.json', 'utf-8')
);