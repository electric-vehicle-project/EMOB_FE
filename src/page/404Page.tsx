// Update the import path below to the correct location of ErrorTemplate
import { ErrorTemplate } from "../components/templates/ErrorTemplate";

export const NotFoundPage = () => (
  <ErrorTemplate>
    <img className="absolute" src="src\assets\images\Frame 27.png" alt="" />
    <img className="absolute" src="src\assets\images\404.png" alt="" />
  </ErrorTemplate>
);
