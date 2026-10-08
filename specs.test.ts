import { createSteps, registerBridleSpecs } from "vitest-bridle";
import { accessSteps } from "./specs/steps/access.js";
import { renderingSteps } from "./specs/steps/rendering.js";
import { editsSteps } from "./specs/steps/edits.js";
import { treeSteps } from "./specs/steps/tree.js";
import { messageSteps } from "./specs/steps/message.js";
import { todaySteps } from "./specs/steps/today.js";

const steps = createSteps();
accessSteps(steps);
treeSteps(steps);
renderingSteps(steps);
editsSteps(steps);
todaySteps(steps);
messageSteps(steps);

await registerBridleSpecs({ steps });
