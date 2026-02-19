export default function MyFiles() {
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Files</h1>
          <p className="text-gray-500">
            Manage, organize, and share all your stored files
          </p>
        </div>

        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">
          Add New
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        {["Type", "People", "Sort By"].map((item) => (
          <select key={item} className="border rounded-lg px-3 py-2 text-sm">
            <option>{item}</option>
          </select>
        ))}
      </div>

      {/* Folders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          "Folder 01",
          "Folder 02",
          "Folder 03",
          "Folder 04",
          "Folder 05",
          "Folder 06",
          "Folder 07",
        ].map((folder) => (
          <div
            key={folder}
            className="bg-white p-4 rounded-xl shadow border-l-4 border-orange-500 flex justify-between items-center"
          >
            <span className="font-medium">{folder}</span>
            ⌄
          </div>
        ))}
      </div>

      {/* Files */}
      <div className="flex gap-4">
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-red-500 w-48 flex justify-between">
          <span>File01.pdf</span> ⌄
        </div>

        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500 w-48 flex justify-between">
          <span>File02.docx</span> ⌄
        </div>
      </div>
    </div>
  );
}
