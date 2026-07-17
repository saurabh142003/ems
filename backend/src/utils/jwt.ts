import jwt from "jsonwebtoken";

export const signToken = (id: string, role: string): string => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || "ems_super_secret_jwt_key_2026_prod_ready_secure",
    {
      expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as any,
    },
  );
};

export const verifyToken = (token: string): any => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || "ems_super_secret_jwt_key_2026_prod_ready_secure",
  );
};
