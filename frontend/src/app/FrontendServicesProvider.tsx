import { ServicesContext } from "./serviceContext";
import type { FrontendServices } from "./serviceTypes";

export function FrontendServicesProvider({
  services,
  children,
}: React.PropsWithChildren<{ services: FrontendServices }>) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}
