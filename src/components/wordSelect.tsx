import { Button, MenuItem } from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";
import { Dictionary, FullEntry } from "../dictionary";
import { useContext } from "react";

const filterDiacritics = (str: string) => str.normalize("NFD").replace(/\p{Diacritic}/gu, "");

const filterEntry: ItemPredicate<FullEntry> = (query: string, entry: FullEntry, _index, exactMatch) => {
  const normalizedEng = entry.meanings.map((i) => i.eng.toLowerCase());
  const normalizedQuery = filterDiacritics(query.toLowerCase());

  if (exactMatch) {
    return filterDiacritics(entry.sol) === normalizedQuery || normalizedEng.includes(normalizedQuery);
  } else {
    return `${filterDiacritics(entry.sol)} ${normalizedEng.join("; ")}`.indexOf(normalizedQuery) >= 0;
  }
};

const renderEntry: ItemRenderer<FullEntry> = (entry, { handleClick, handleFocus, modifiers, query }) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }
  let eng = entry.meanings[0].eng;
  if (entry.meanings.length > 1) {
    eng += "; ...";
  }
  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={entry.hash}
      label={entry.extra}
      onClick={handleClick}
      onFocus={handleFocus}
      roleStructure="listoption"
      text={`${entry.sol}: ${eng}`}
    />
  );
};

export function WordSelect({ onSelect }: { onSelect: (entry: FullEntry) => void }) {
  const { entries } = useContext(Dictionary);
  return (
    <Select<FullEntry>
      items={entries || []}
      itemPredicate={filterEntry}
      itemRenderer={renderEntry}
      noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
      onItemSelect={onSelect}
      disabled={entries === null}
    >
      <Button icon="add" intent="primary" fill className="fill-height" disabled={entries === null} />
    </Select>
  );
}
