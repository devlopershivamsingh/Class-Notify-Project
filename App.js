import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./src/App.css"
// Define the draggable item types
const ItemType = {
  SUBJECT: "subject",
  PROFESSOR: "professor",
  CLASSROOM: "classroom",
};

// Draggable Item Component
const DraggableItem = ({ id, name, type }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item: { id, name, type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} className="draggable-item" style={{ opacity: isDragging ? 0.5 : 1 }}>
      {name}
    </div>
  );
};

// DropCell Component
const DropCell = ({ day, time, onDrop, currentClass, onDelete, onLockToggle, isLocked }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemType.SUBJECT, ItemType.PROFESSOR, ItemType.CLASSROOM],
    drop: (item) => !isLocked && onDrop(day, time, item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} className={`drop-cell ${isOver ? "drop-cell--over" : ""} ${isLocked ? "locked" : ""}`}>
      {currentClass?.subject && <div className="cell-item">{currentClass.subject.name}</div>}
      {currentClass?.professor && <div className="cell-item">{currentClass.professor.name}</div>}
      {currentClass?.classroom && <div className="cell-item">{currentClass.classroom.name}</div>}

      {/* Delete Button */}
      {currentClass && Object.keys(currentClass).length > 0 && (
        <button className="delete-btn" onClick={() => onDelete(day, time)}>X</button>
      )}

      {/* Lock Button */}
      <button className="lock-btn" onClick={() => onLockToggle(day, time)}>
        {isLocked ? "🔒" : "🔓"}
      </button>
    </div>
  );
};

// Main App Component
const App = () => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = ["9AM", "10AM", "11AM", "12PM", "2PM", "3PM"];

  const subjects = [{ id: 1, name: "Math" }, { id: 2, name: "Science" }, { id: 3, name: "History" }];
  const professors = [{ id: 1, name: "Dr. Smith" }, { id: 2, name: "Prof. Lee" }, { id: 3, name: "Dr. Brown" }];
  const classrooms = [{ id: 1, name: "Room A" }, { id: 2, name: "Room B" }, { id: 3, name: "Room C" }];

  const [schedule, setSchedule] = useState({});
  const [lockedCells, setLockedCells] = useState(new Set());

  // Handle Drop Action
  const handleDrop = (day, time, item) => {
    setSchedule((prev) => {
      const currentCell = prev[`${day}-${time}`] || {};
      return { ...prev, [`${day}-${time}`]: { ...currentCell, [item.type]: { id: item.id, name: item.name } } };
    });
  };

  // Handle Delete Action
  const handleDelete = (day, time) => {
    setSchedule((prev) => {
      const newSchedule = { ...prev };
      delete newSchedule[`${day}-${time}`];
      return newSchedule;
    });
  };

  // Handle Lock Toggle
  const handleLockToggle = (day, time) => {
    setLockedCells((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(`${day}-${time}`)) {
        newSet.delete(`${day}-${time}`);
      } else {
        newSet.add(`${day}-${time}`);
      }
      return newSet;
    });
  };
  const handleSubmit = () => {
    console.log("Full Timetable:", schedule);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="timetable">
        <h1 className="timetable__title">Timetable Scheduler</h1>

        {/* Draggable Items */}
        <div className="timetable__items">
          <div className="timetable__items-section">
            <h3 className="timetable__items-title">Subjects</h3>
            {subjects.map((subj) => (
              <DraggableItem key={subj.id} {...subj} type={ItemType.SUBJECT} />
            ))}
          </div>
          <div className="timetable__items-section">
            <h3 className="timetable__items-title">Professors</h3>
            {professors.map((prof) => (
              <DraggableItem key={prof.id} {...prof} type={ItemType.PROFESSOR} />
            ))}
          </div>
          <div className="timetable__items-section">
            <h3 className="timetable__items-title">Classrooms</h3>
            {classrooms.map((room) => (
              <DraggableItem key={room.id} {...room} type={ItemType.CLASSROOM} />
            ))}
          </div>
        </div>

        {/* Timetable Grid */}
        <table className="timetable-grid">
          <thead>
            <tr>
              <th></th>
              {times.map((time) => (
                <th key={time}>{time}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td>{day}</td>
                {times.map((time) => (
                  <td key={`${day}-${time}`}>
                    <DropCell
                      day={day}
                      time={time}
                      onDrop={handleDrop}
                      currentClass={schedule[`${day}-${time}`] || {}}
                      onDelete={handleDelete}
                      onLockToggle={handleLockToggle}
                      isLocked={lockedCells.has(`${day}-${time}`)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {/* Submit Button */}
      <button onClick={handleSubmit} className="submit-btn">Submit Timetable</button>
      </div>
    </DndProvider>
  );
};

export default App;
