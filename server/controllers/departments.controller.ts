export const DepartmentsController = {
  listDepartments: (req: any, res: any) => {
    res.json([
      "Computer Science",
      "Electronic Engineering",
      "Mechanical Engineering",
      "Mathematics & Statistics",
      "Administration"
    ]);
  }
};
