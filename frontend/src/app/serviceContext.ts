import { createContext, useContext } from "react";
import type { FrontendServices } from "./serviceTypes";

export const ServicesContext = createContext<FrontendServices | null>(null);

export function useFrontendServices() {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error("Frontend services provider is missing.");
  }
  return services;
}
