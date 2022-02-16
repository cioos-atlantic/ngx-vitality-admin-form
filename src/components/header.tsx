import React from 'react';

class Header extends React.Component {

    imgUrl = "https://cioosatlantic.ca/wp-content/themes/cioos-siooc-wordpress-theme/img/CIOOS-watermark.svg?x48800"



    render() {
        return (
            <header id="masthead" className="page-header">
                <div className="pre-nav">
                    <div className="container">
                        <div className="nationallogo">
                          <img className="lazy loaded" alt="CIOOS National" 
                            src={this.imgUrl} 
                            data-src={this.imgUrl} 
                            data-was-processed="true" />
                        </div>
                    </div>
                </div>
            </header>
        )
    }

} 

export default Header;