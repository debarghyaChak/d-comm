const SortDropdown = ({ setSortOption }) => {
  return (
    <div className="flex justify-end mb-6">
      <select
        className="p-2 border rounded-md bg-white shadow-md"
        onChange={(e) => setSortOption(e.target.value)}
      >
        <option value="default">Sort by</option>
        <option value="price-high">Price: Highest to Lowest</option>
        <option value="price-low">Price: Lowest to Highest</option>
        <option value="alphabetical">Alphabetically</option>
      </select>
    </div>
  );
};

export default SortDropdown;
