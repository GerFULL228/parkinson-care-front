// components/GraficoTendencias.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// ✅ REGISTRAR los elementos necesarios para gráfico de líneas
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GraficoTendencias = ({ datos }) => {
  if (!datos || !datos.labels || datos.labels.length === 0) {
    return (
      <div className="alert alert-info text-center">
        No hay suficientes datos para mostrar la tendencia
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Evolución de Síntomas',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}/10`;
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        title: {
          display: true,
          text: 'Nivel de Severidad (1-10)'
        },
        ticks: {
          stepSize: 1
        }
      },
      x: {
        title: {
          display: true,
          text: 'Fecha'
        }
      }
    }
  };

  const data = {
    labels: datos.labels,
    datasets: [
      {
        label: 'Temblor',
        data: datos.temblor,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Rigidez',
        data: datos.rigidez,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(53, 162, 235)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Bradicinesia',
        data: datos.bradicinesia,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Equilibrio',
        data: datos.equilibrio,
        borderColor: 'rgb(255, 205, 86)',
        backgroundColor: 'rgba(255, 205, 86, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(255, 205, 86)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  return (
    <div style={{ height: '400px' }}>
      <Line 
        key={JSON.stringify(datos)} // ✅ KEY única para evitar reutilización
        options={options} 
        data={data} 
      />
    </div>
  );
};

export default GraficoTendencias;