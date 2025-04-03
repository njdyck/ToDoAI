import React from 'react';

function TodoControls({ 
    onSortChange, 
    onFilterChange,
    currentSort,
    currentFilter 
}) {
    return (
        <div className="controls">
            <select 
                id="filter-priority" 
                value={currentFilter}
                onChange={(e) => onFilterChange(e.target.value)}
            >
                <option value="all">Alle Prioritäten</option>
                <option value="high">Hoch</option>
                <option value="medium">Mittel</option>
                <option value="low">Niedrig</option>
            </select>
            <select 
                id="sort-by" 
                value={currentSort}
                onChange={(e) => onSortChange(e.target.value)}
            >
                <option value="default">Standard</option> 
                <option value="date">Nach Datum</option>
                <option value="priority">Nach Priorität</option>
            </select>
        </div>
    );
}

export default TodoControls; 