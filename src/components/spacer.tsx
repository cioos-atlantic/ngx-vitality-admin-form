import React from 'react';

class Spacer extends React.Component {

    render() {
        return (
        <div className="pre-nav">
            <div className="container">
                <div className="nationalLogo">
                    <img 
                    alt="CIOOS National Logo"
                    src="https://cioosatlantic.ca/wp-content/themes/cioos-siooc-wordpress-theme/img/CIOOS-watermark.svg?x48800">
                    </img>
                </div>
                <aside>
                    <p> <a href="https://cioos.ca/">A CIOOS Project</a></p>
                </aside>
            </div> 
        </div>
        );
    }

}

export default Spacer;