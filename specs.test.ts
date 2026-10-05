import { createSteps, registerBridleSpecs } from "vitest-bridle";
import { accessSteps } from "./specs/steps/access.js";
import { treeSteps } from "./specs/steps/tree.js";

const steps = createSteps();
accessSteps(steps);
treeSteps(steps);

await registerBridleSpecs({ steps });
