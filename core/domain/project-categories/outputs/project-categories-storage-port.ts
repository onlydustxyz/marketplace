import { GetProjectCategoriesPortResponse } from "core/domain/project-categories/project-categories-contract.types";

export interface ProjectCategoriesStoragePort {
  routes: Record<string, string>;
  getProjectCategories(): GetProjectCategoriesPortResponse;
}
