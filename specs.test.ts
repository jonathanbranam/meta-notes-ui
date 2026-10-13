import { createSteps, registerBridleSpecs } from "vitest-bridle";
import { accessSteps } from "./specs/steps/access.js";
import { renderingSteps } from "./specs/steps/rendering.js";
import { editsSteps } from "./specs/steps/edits.js";
import { treeSteps } from "./specs/steps/tree.js";
import { messageSteps } from "./specs/steps/message.js";
import { todaySteps } from "./specs/steps/today.js";
import { lastpageSteps } from "./specs/steps/lastpage.js";
import { treepaneSteps } from "./specs/steps/treepane.js";
import { pushSteps } from "./specs/steps/push.js";
import { neighboursSteps } from "./specs/steps/neighbours.js";

const steps = createSteps();
accessSteps(steps);
treeSteps(steps);
renderingSteps(steps);
editsSteps(steps);
todaySteps(steps);
messageSteps(steps);
lastpageSteps(steps);
treepaneSteps(steps);
neighboursSteps(steps);
pushSteps(steps);

await registerBridleSpecs({ steps });
