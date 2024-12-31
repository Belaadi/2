import { Prisma } from ".prisma/client";
import FullAccessModuleHandler from "@backend/modules/template/FullAccessModuleHandler";
import UserDelegate = Prisma.UserDelegate;

class LimitedModuleAccessHandler<
  T extends
    | UserDelegate
    | {
        [key: string | symbol]: any;
      },
  CreateType,
> extends FullAccessModuleHandler<T, CreateType> {
  getPrismaModel():
    | { [p: string]: any; [p: symbol]: any }
    | undefined {
    return undefined;
  }

  DELETE(): any {
    this.methodDeny();
  }

  async POST() {
    this.methodDeny();
  }

  canCreate() {
    return false
  }

  canEdit() {
    return false;
  }
}

export default LimitedModuleAccessHandler;