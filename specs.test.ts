import { createSteps, registerBridleSpecs } from "vitest-bridle";
import { accessSteps } from "./specs/steps/access.js";

const steps = createSteps();
accessSteps(steps);

await registerBridleSpecs({ steps });
