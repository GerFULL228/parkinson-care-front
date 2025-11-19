// components/GraficoComparativa.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// ✅ REGISTRAR los elementos necesarios para gráfico de barras
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GraficoComparativa = ({ datos }) => {
  if (!datos || !datos.promedios) {
    return (
      <div className="alert alert-info text-center">
        No hay datos para comparar
      </div>
    );
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Comparativa de Síntomas',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Nivel: ${context.parsed.y}/10`;
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
          text: 'Nivel Promedio'
        },
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const barData = {
    labels: datos.categorias,
    datasets: [
      {
        label: 'Nivel Promedio',
        data: datos.promedios,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(53, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 205, 86, 0.8)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(53, 162, 235)',
          'rgb(75, 192, 192)',
          'rgb(255, 205, 86)',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div>
      <div style={{ height: '300px' }}>
        <Bar 
          key={JSON.stringify(datos)} // ✅ KEY única para evitar reutilización
          options={barOptions} 
          data={barData} 
        />
      </div>
      
      <div className="mt-3 p-3 bg-light rounded">
        <div className="row">
          <div className="col-md-6">
            <strong className="text-success">✓ Mejor controlado:</strong> 
            <span className="ms-2">{datos.mejorSintoma}</span>
          </div>
          <div className="col-md-6">
            <strong className="text-danger">⚠ Más severo:</strong> 
            <span className="ms-2">{datos.peorSintoma}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficoComparativa;