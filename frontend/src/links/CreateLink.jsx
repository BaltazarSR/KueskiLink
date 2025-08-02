// src/links/CreateLink.jsx
import SubpageLayout from "../layouts/SubpageLayout";
import CreateLinkForm from "./CreateLinkForm";
import { useCreateLink } from "../hooks/useCreateLink";

function CreateLink() {
  const linkProps = useCreateLink();

  return (
    <SubpageLayout title="Crear link de pago" fallbackPath="/">
      <CreateLinkForm {...linkProps} />
    </SubpageLayout>
  );
}

export default CreateLink;
