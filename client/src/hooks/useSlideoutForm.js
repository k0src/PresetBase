import { useCallback } from "react";
import { useSlideoutData } from "./useSlideoutData";

export function useSlideoutForm() {
  const { entryType, entryId, updateEntryData, deleteEntryData } =
    useSlideoutData();

  const collectFormData = useCallback((form) => {
    console.log("submit");

    const formData = new FormData(form);
    console.log(formData);

    // const formData = new FormData();
    // // Collect basic form inputs
    // const inputs = form.querySelectorAll(
    //   'input[type="text"], input[type="number"], input[type="url"], input[type="email"], textarea'
    // );
    // inputs.forEach((input) => {
    //   if (input.name && input.value) {
    //     formData.append(input.name, input.value);
    //   }
    // });
    // // Collect file inputs
    // const fileInputs = form.querySelectorAll('input[type="file"]');
    // fileInputs.forEach((input) => {
    //   if (input.files && input.files.length > 0) {
    //     formData.append(input.name, input.files[0]);
    //   }
    // });
    // // Collect hidden inputs (for relationships)
    // const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
    // hiddenInputs.forEach((input) => {
    //   if (input.name && input.value) {
    //     // Parse relationship data
    //     const match = input.name.match(/^(\w+)\[(\d+)\]\[(\w+)\]$/);
    //     if (match) {
    //       const [, table, index, field] = match;
    //       if (!formData.has(`${table}_data`)) {
    //         formData.append(`${table}_data`, JSON.stringify({}));
    //       }
    //       const tableData = JSON.parse(formData.get(`${table}_data`));
    //       if (!tableData[index]) {
    //         tableData[index] = {};
    //       }
    //       tableData[index][field] = input.value;
    //       formData.set(`${table}_data`, JSON.stringify(tableData));
    //     } else {
    //       formData.append(input.name, input.value);
    //     }
    //   }
    // });
    // return formData;
  }, []);

  const handleSubmit = useCallback(
    async (form) => {
      const formData = collectFormData(form);
      // return await updateEntryData(formData);
    },
    [collectFormData, updateEntryData]
  );

  const handleDelete = useCallback(async () => {
    // return await deleteEntryData();
  }, [deleteEntryData]);

  return {
    handleSubmit,
    handleDelete,
    collectFormData,
  };
}
