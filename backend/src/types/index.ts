import { Request } from "express";
import { IEmployee } from "../models/employee.model";

export interface AuthenticatedRequest extends Request {
  user?: IEmployee;
}
