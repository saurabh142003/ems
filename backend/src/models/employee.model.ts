import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IEmployee extends Document {
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: "Super Admin" | "HR Manager" | "Employee";
  department: string;
  designation: string;
  salary: number;
  joiningDate: Date;
  status: "Active" | "Inactive" | "Suspended";
  manager?: Schema.Types.ObjectId | IEmployee | null;
  profileImage?: string;
  isDeleted: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: {
        values: ["Super Admin", "HR Manager", "Employee"],
        message: "{VALUE} is not a valid role",
      },
      default: "Employee",
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ["Active", "Inactive", "Suspended"],
        message: "{VALUE} is not a valid status",
      },
      default: "Active",
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    profileImage: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
EmployeeSchema.pre<IEmployee>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Compare entered password with hashed password in database
EmployeeSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password || "");
};

export const Employee = model<IEmployee>("Employee", EmployeeSchema);
export default Employee;
