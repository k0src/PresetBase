import { memo } from "react";

import SlideoutList from "../../SlideoutList/SlideoutList";

const SectionLists = memo(function SectionLists({
  lists,
  data,
  handleInputChange,
}) {
  return (
    <>
      {lists?.map((list) => (
        <SlideoutList
          key={list.key}
          id={list.key}
          label={list.label}
          listItems={data[list.key] || []}
          hasInput={list.hasInput}
          inputLabel={list.inputLabel}
          hasAudio={list.hasAudio}
          dataFields={list.dataFields}
          searchTable={list.searchTable}
          relationTable={list.relationTable}
          onChange={handleInputChange}
        />
      ))}
    </>
  );
});

export default SectionLists;
