import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import hexToRgba from 'hex-to-rgba';

const getCasesByCountry = async (countryID) => {
    const result = await axios(
        `https://coronavirus-tracker-api.herokuapp.com/v2/locations/${countryID}`,
    );
    return result.data.location;
};

function App() {
    const index = 0;
    const [countries, setCountry] = useState([{
        ID: 116,
        label: 'France',
        color: '#856c8b',
    },
    {
        ID: 137,
        label: 'Italy',
        color: '#d4ebd0',
    },
    {
        ID: 223,
        label: 'UK',
        color: '#a4c5c6',
    },
    {
        ID: 225,
        label: 'US',
        color: '#ffeb99',
    },
    ]);

    const [type, setType] = useState('deaths');

    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState({ datasets: [], labels: [] });

    const fetchData = async (country, index) => {
        getCasesByCountry(country.ID).then((response) => {
            setCountry((countries) => ([
                ...countries,
                ['confirmed', 'deaths', 'recovered'].forEach((state) => {
                    countries.find((item) => item.ID == country.ID)[state] = response.timelines[state].timeline;
                }),
            ]));

            processData(country, (index === 0));
        });
    };

    const processData = (country, firstTime) => {
        if (firstTime) {
            const arrayLabel = Object.entries(country[type]).map((item) => item[0].replace('T00:00:00Z', ''));
            setData((data) => ({ ...data, labels: arrayLabel }));
        }

        const newData = {
            label: country.label,
            data: Object.entries(country[type]).map((item) => item[1]),
            order: index + 1,
            borderColor: country.color,
            backgroundColor: hexToRgba(country.color, '.3'),
        };

        setData((data) => ({ ...data, datasets: [...data.datasets, newData] }));

        setLoaded(true);
    };

    useEffect(() => {
        countries.forEach((country, index) => {
            fetchData(country, index);
        });
    }, []);

    const handleRadioChange = (e) => {
        setData({ datasets: [], labels: [] });
        setType(e.target.value);
		countries.forEach((country, index) => {
			if (!country) return;
			processData(country, (index === 0));
		});
    };

    return (
      <div>
          {loaded
                ? (
                  <div>
                      {console.log(data)}
                      <Line
                          data={data}
                          width={800}
                          height={600}
                          options={{ maintainAspectRatio: false }}
                        />
                      <form>
                          { ['confirmed', 'deaths', 'recovered'].map((item, i) => (
                              <label htmlFor={item} key={i}>
                                  <input
                                      type="radio"
                                      id={item}
                                      name="type"
                                      value={item}
                                      checked={type === item}
                                      onChange={handleRadioChange}
                                    />
                                  {item}
                                </label>
                            )) }
                        </form>
                    </div>
                )
                :			<p>Loading</p>}
        </div>
    );
}
export default App;
