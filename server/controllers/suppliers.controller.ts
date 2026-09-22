import { db } from "../db";

export const SuppliersController = {
  listSuppliers: (req: any, res: any) => {
    try {
      const list = db.prepare("SELECT * FROM suppliers").all();
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: "Lacks connection to database suppliers register", details: err.message });
    }
  }
};
