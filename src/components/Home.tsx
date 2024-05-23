import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      <h1>Home</h1>
      <ul>
        <li>
          <Link to="/table">Go to Table</Link>
        </li>
        <li>
          <Link to="/analytics">Go to Analytics</Link>
        </li>
      </ul>
    </div>
  );
};

export default Home;
