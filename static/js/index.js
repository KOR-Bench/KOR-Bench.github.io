$(document).ready(function() {
  const options = {
    slidesToScroll: 1,
    slidesToShow: 1,
    loop: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
  }
  // Initialize all div with carousel class
  const carousels = bulmaCarousel.attach('.carousel', options);

})

document.addEventListener('DOMContentLoaded', function() {
  loadTableData();
  setupEventListeners();
  window.addEventListener('resize', adjustNameColumnWidth);
});

let currentModelType = 'chat model';

function loadTableData() {
  fetch('./kor_leaderboard_data.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      renderTable(data);
    })
    .catch(error => {
      document.querySelector('#kor-bench-table tbody').innerHTML = `
        <tr>
            <td colspan="11"> Error loading data: ${error.message}<br> Please ensure you're accessing this page through a web server (http://localhost:8000) and not directly from the file system. </td>
        </tr>
      `;
    });
}

function renderTable(data) {
  const tbody = document.querySelector('#kor-bench-table tbody');
  tbody.innerHTML = ''; // 清除现有行

  const scores = prepareScoresForStyling(data);

  data.forEach((row, index) => {
    if (row.type === currentModelType) {
      const tr = document.createElement('tr');
      tr.setAttribute('data-original-index', index); // 保存原始索引
      tr.innerHTML = `
        <td><a href="${row.link}" target="_blank">${row.model}</a></td>
        <td>${row.size}</td>
        <td>${row.date}</td>
        <td>${formatScore(row.overall, scores.overall[index], row.type)}</td>
        <td>${formatScore(row.operation, scores.operation[index], row.type)}</td>
        <td>${formatScore(row.logic, scores.logic[index], row.type)}</td>
        <td>${formatScore(row.cipher, scores.cipher[index], row.type)}</td>
        <td>${formatScore(row.puzzle, scores.puzzle[index], row.type)}</td>
        <td>${formatCounterfactualScore(row.counterfactual, scores.counterfactualOutside[index], scores.counterfactualInside[index], row.type)}</td>
      `;
      tr.style.backgroundColor = row.open ? 'rgba(144, 238, 144, 0.1)' : 'rgba(117, 209, 215, 0.1)';
      tbody.appendChild(tr);
    }
  });
}

function formatScore(value, rank, type) {
  if (rank === 0) {
    return `<strong>${value}</strong>`;
  }
  if (rank === 1) {
    return `<u>${value}</u>`;
  }
  return value;
}

function formatCounterfactualScore(value, outsideRank, insideRank, type) {
  const match = value.match(/(\d+\.\d+)\((\d+\.\d+)\)/);
  if (match) {
    const outsideValue = match[1];
    const insideValue = match[2];

    function formatValue(value, rank) {
      if (rank === 0) {
        return `<strong>${value}</strong>`;
      }
      if (rank === 1) {
        return `<u>${value}</u>`;
      }
      return value;
    }
    const formattedOutside = formatValue(outsideValue, outsideRank);
    const formattedInside = formatValue(insideValue, insideRank);

    return `${formattedOutside} (${formattedInside})`;
  }
  return value;
}

function setupEventListeners() {
  document.getElementById('toggle-model-type').addEventListener('click', function() {
    currentModelType = currentModelType === 'chat model' ? 'base model' : 'chat model';
    this.textContent = `${currentModelType === 'chat model' ? 'Chat Models (Tap to switch to Base)' : 'Base Models (Tap to switch to Chat)'}`;
    loadTableData();
  });

  const headers = document.querySelectorAll('#kor-bench-table thead tr:last-child th.sortable');
  headers.forEach(header => {
    header.addEventListener('click', function() {
      if (this.textContent.trim() === 'Model') {
        resetTable();
      } else {
        sortTable(this);
      }
    });
  });
}

function sortTable(header) {
  const table = document.getElementById('kor-bench-table');
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const headers = Array.from(header.parentNode.children);
  const columnIndex = headers.indexOf(header);
  const isDescending = header.classList.contains('asc');

  rows.sort((a, b) => {
    const aValue = a.children[columnIndex].textContent.trim();
    const bValue = b.children[columnIndex].textContent.trim();

    let aSize = parseSize(aValue);
    let bSize = parseSize(bValue);

    return isDescending ? bSize - aSize : aSize - bSize;
  });

  headers.forEach(th => th.classList.remove('asc', 'desc'));
  header.classList.add(isDescending ? 'desc' : 'asc');

  rows.forEach(row => tbody.appendChild(row));
}

function resetTable() {
  const table = document.getElementById('kor-bench-table');
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));

  // Reset to original order
  rows.sort((a, b) => a.rowIndex - b.rowIndex);

  rows.forEach(row => tbody.appendChild(row));

  const overallHeader = document.querySelector('#kor-bench-table thead tr:last-child th.sortable:nth-child(4)');
  overallHeader.classList.add('asc'); // 添加降序排序的类
  sortTable(overallHeader);
  // Remove sorting classes
  const headers = table.querySelectorAll('th');
  headers.forEach(th => th.classList.remove('asc', 'desc'));
}

function parseSize(sizeStr) {
  // Remove 'B' and trim the string
  sizeStr = sizeStr.replace(/B/g, '').trim();

  // If the string contains 'x', split and multiply the numbers
  if (sizeStr.includes('x')) {
    const [width, height] = sizeStr.split('x').map(Number);
    return width * height;
  }

  // If the string is a number, parse it
  const sizeNum = parseFloat(sizeStr);
  if (!isNaN(sizeNum)) {
    return sizeNum;
  }

  // If no valid number is found, return Infinity
  return Infinity;
}

function adjustNameColumnWidth() {
  const nameColumn = document.querySelectorAll('#kor-bench-table td:first-child, #kor-bench-table th:first-child');
  let maxWidth = 0;

  const span = document.createElement('span');
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.style.whiteSpace = 'nowrap';
  document.body.appendChild(span);

  nameColumn.forEach(cell => {
    span.textContent = cell.textContent;
    const width = span.offsetWidth;
    if (width > maxWidth) {
      maxWidth = width;
    }
  });

  document.body.removeChild(span);

  maxWidth += 20; // Increased padding

  nameColumn.forEach(cell => {
    cell.style.width = `${maxWidth}px`;
    cell.style.minWidth = `${maxWidth}px`; // Added minWidth
    cell.style.maxWidth = `${maxWidth}px`;
  });
}

function prepareScoresForStyling(data) {
  const scores = {};
  const fields = [
    'overall', 'operation', 'logic', 'cipher', 'puzzle'
  ];

  fields.forEach(field => {
    const baseValues = data.filter(row => row.type === 'base model').map(row => row[field])
                           .filter(value => value !== '-' && value !== undefined && value !== null)
                           .map(parseFloat);

    const chatValues = data.filter(row => row.type === 'chat model').map(row => row[field])
                           .filter(value => value !== '-' && value !== undefined && value !== null)
                           .map(parseFloat);

    scores[field] = data.map(row => {
      const value = row[field];
      if (value === '-' || value === undefined || value === null) {
        return -1;
      }
      const values = row.type === 'base model' ? baseValues : chatValues;
      const sortedValues = [...new Set(values)].sort((a, b) => b - a);
      return sortedValues.indexOf(parseFloat(value));
    });
  });

  // Special handling for counterfactual
  const baseCounterfactualOutsideValues = data.filter(row => row.type === 'base model').map(row => {
    const match = row.counterfactual.match(/(\d+\.\d+)\((\d+\.\d+)\)/);
    return match ? parseFloat(match[1]) : null;
  }).filter(value => value !== null);

  const chatCounterfactualOutsideValues = data.filter(row => row.type === 'chat model').map(row => {
    const match = row.counterfactual.match(/(\d+\.\d+)\((\d+\.\d+)\)/);
    return match ? parseFloat(match[1]) : null;
  }).filter(value => value !== null);

  const baseCounterfactualInsideValues = data.filter(row => row.type === 'base model').map(row => {
    const match = row.counterfactual.match(/(\d+\.\d+)\((\d+\.\d+)\)/);
    return match ? parseFloat(match[2]) : null;
  }).filter(value => value !== null);

  const chatCounterfactualInsideValues = data.filter(row => row.type === 'chat model').map(row => {
    const match = row.counterfactual.match(/(\d+\.\d+)\((\d+\.\d+)\)/);
    return match ? parseFloat(match[2]) : null;
  }).filter(value => value !== null);

  scores.counterfactualOutside = data.map(row => {
    const match = row.counterfactual.match(/(\d+\.\d+)\((\d+\.\d+)\)/);
    const value = match ? parseFloat(match[1]) : null;
    const values = row.type === 'base model' ? baseCounterfactualOutsideValues : chatCounterfactualOutsideValues;
    const sortedValues = [...new Set(values)].sort((a, b) => b - a);
    return value !== null ? sortedValues.indexOf(value) : -1;
  });

  scores.counterfactualInside = data.map(row => {
    const match = row.counterfactual.match(/(\d+\.\d+)\((\d+\.\d+)\)/);
    const value = match ? parseFloat(match[2]) : null;
    const values = row.type === 'base model' ? baseCounterfactualInsideValues : chatCounterfactualInsideValues;
    const sortedValues = [...new Set(values)].sort((a, b) => a - b);
    return value !== null ? sortedValues.indexOf(value) : -1;
  });

  return scores;
}