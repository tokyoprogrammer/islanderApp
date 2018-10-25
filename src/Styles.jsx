// Common
export const DivW100Style = {
  width: "100%"
};
export const DivH100Style = {
  height: "100%"
};
export const DivWH100Style = {
  width: "100%",
  height: "100%"
};
export const CenterDivStyle = {
  textAlign: "center"
};
// App / Navigator / Menu
export const MenuStyle = {
  logo: {
    style: {
      islander: {
        width: '40%',
        marginLeft: '30%',
        marginRight: '30%',
        marginBotton: '4%',
        marginTop: '4%'
      },
      plane: {
        color: "#00CED1"
      },
      milgam: {
        marginTop: "5px",
        height: "20px"
      },
    },
    imgs: {
      islander: "img/islander.png",
      milgam: "img/milgam.png"
    },
    icon: {
      plane: "plane"
    }
  },
  list: {
    container: {
      style: {
        height: "60px"
      }
    }
  }
};
// Common Top Toolbar Style
export const ToolbarStyle = {
  btns: {
    lang: {
      imgs: {
        eng: "img/english.png",
        kor: "img/korean.png",
        style: {
          width: "33px"
        }
      }
    }
  },
  title: {
    imgs: {
      milgam: "img/milgam.png",
      style: {
        height: "15px",
        marginTop: "5%"
      } 
    }
  },
  menu: {
    icon: "ion-navicon, material:md-menu",
    size: {
      default: 32
    }
  }
};
// HomePage Style
export const HomeStyle = {
  weather: {
    container: {
      style: {
        position: "absolute", 
        top: "10px", 
        textAlign: "center", 
        borderRadius: "6px", 
        right: "10px", 
        backgroundColor: "rgba(255, 250, 250, .4)"
      }
    },
    icon: {
      style: {
        width: "40px",
        float: "left"
      }
    },
    text: {
      style: {
        float: "left",
        marginTop: "10%",
        color: "#000000"
      },
      degree: "ºC"
    }
  },
  list: {
    container: {
      style: {
        margin: "3%",
        marginTop: "-15%",
        boxShadow: "2px 0px 2px 2px #9E9E9E"
      }
    },
    btns: {
      outer: {
        style: {
          backgroundColor: "rgba(255, 255, 255, 1.0)", 
          marginBottom: "1%",
          boxShadow: "0px 2px 2px 2px #9E9E9E",
          width: "100%"
        }
      },
      inner: {
        container: {
          style: {
            margin: '1%',
            textAlign: "center",
            width: "100%",
            height: "70px",
            display: "flex" 
          }
        },
        icon: {
          style: {
            width: "50px",
            height: "50px",
            marginTop: "auto",
            marginBottom: "auto",
            marginRight: "5%" 
          },
          imgs: {
            sightseeing: "img/sightseeing.png",
            food: "img/food.png",
            culture: "img/culture.png",
            festival: "img/festival.png",
            activity: "img/activity.png",
            shopping: "img/shopping.png"
          }
        },
        text: {
          style: {
            fontSize: "20px",
            color: "#000000",
            marginTop: "auto",
            marginBottom: "auto" 
          }
        }
      }
    }
  }
};
// MapView
export const MapViewStyle = {
  carouselItem: {
    container: {
      style: {
        height: "35%",
        padding: "1px 0 0 0",
        textAlign: "center"
      }
    },
    titleRow: {
      col1: {
        width: "80%"
      },
      col2: {
        width: "20%",
        containerDiv: {
          style: {
            textAlign: "center"
          }
        }
      }
    },
    contentRow: {
      style: {
        width: "100%"
      },
      col1: {
        width: "5%",
        arrowIcon: {
          button: {
            style: {
              width: "100%",
              padding: "5%"
            }
          },
          iconLeft: "md-chevron-left",
          size: {
            default: 30,
            material: 28
          }
        },
      },
      col2: {
        width: "37%",
        container: {
          style: {
            textAlign: "center",
            padding: "1%"
          }
        }
      },
      col3: {
        width: "53%",
        container: {
          style: {
            padding: "1%"
          },
          addrText: {
            style: {
              margin: "1%"
            }
          },
          zipCode: {
            style: {
              color: "#A9A9A9",
              margin: "1%"
            }
          },
          detailBtn: {
            style: {
              margin: "2%"
            }
          }
        }
      },
      col4: {
        width: "5%",
        arrowIcon: {
          button: {
            style: {
              width: "100%",
              padding: "5%"
            }
          },
          iconRight: "md-chevron-right",
          size: {
            default: 30,
            material: 28
          }
        }
      }
    },
    badge: {
      style: {
        color: "#ffffff",
        backgroundColor: "#17a2b8",
        marginLeft: "1%",
        padding: ".25em .4em",
        fontSize: "75%",
        lineHeight: "1",
        verticalAlign: "baseline",
        textAlign: "center",
        display: "inline-block",
        borderRadius: ".25rem"
      }
    },
    img: {
      google: {
        width: 400,
        height: 400
      },
      style: {
        width: "100%",
        padding: "5%"
      }
    },
    title: {
      style: {
        margin: "1%"
      }
    },
    favoriteBtn: {
      size: {
        default: 30,
        material: 28
      },
      colors: {
        gray: "#D3D3D3",
        gold: "#FFD700"
      },
      icon: "md-star"
    }
  },
  fixedFab: {
    position: "bottom right",
    icon: "fa-bars"
  },
  mapMarker: {
    dotText: "%E2%80%A2"
  }
};
