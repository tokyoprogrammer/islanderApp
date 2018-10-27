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

const logoURL = "img/logo.png";
const logoURL2 = "img/logo2.png"
const commonBadgeStyle = {
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
};
const commonGrayColor = "D3D3D3";
const commonGoldColor = "FFD700";
const commonRedColor = "DC124C";
const commonStarSize = {
  default: 30
};
const commonMapCenter = {
  lat: 33.356432,
  lng: 126.5268767
}
 
// App / Navigator / Menu
export const MenuStyle = {
  logo: {
    img: {
      url: logoURL,
      url2: logoURL2,
      style: {
        height: "70px"
      }
    },
    circleImg: {
      url: "img/islander.png",
      style: {
        width: '40%',
        marginLeft: '30%',
        marginRight: '30%',
        marginBotton: '4%',
        marginTop: '4%'
      }
    },
    text: {
      text: "JEJU",
      style: {
        marginTop: "0px",
        fontSize: "15px",
        fontWeight: "bold",
        marginBottom: "10px",
        textAlign: "center"
      },
      spanStyle: {
        lineHeight: "0.5",
        textAlign: "center",
        display: "inline-block",
        position: "relative"
      },
      className: "appName",
      psuedoContent: [
        ".appName span:after, .appName span:before {",
        "  content: '';",
        "  position: absolute;",
        "  height: 5px;",
        "  border-bottom: 1px solid #A9A9A9;",
        "  border-top: 1px solid #A9A9A9;",
        "  top: 0;",
        "  width: 80%;",
        "}",
        ".appName span:before {",
        "  right: 100%;",
        "  margin-right: 10px;",
        "}",
        ".appName span:after {",
        "  left: 100%;",
        "  margin-left: 10px;",
        "}"
      ]
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
      },
      logo: {
        url: "img/logo.png",
        style: {
          padding: "3%",
          height: "100%",
          objectFit: "contain",
          marginLeft: "auto",
          marginRight: "auto",
          display: "block" 
        }
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
            height: "60px",
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
            default: 30
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
            default: 30
          }
        }
      }
    },
    badge: {
      style: commonBadgeStyle
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
      size: commonStarSize,
      colors: {
        gray: "#" + commonGrayColor,
        gold: "#" + commonGoldColor
      },
      icon: "md-star",
      style: {
        width: "100%",
        textAlign: "center"
      }
    }
  },
  fixedFab: {
    position: "bottom right",
    icon: "fa-bars"
  },
  mapMarker: {
    dotText: "%E2%80%A2",
    gray: commonGrayColor,
    red: commonRedColor
  },
  map: {
    size: {
      width: "100vw",
      height: "35vh"
    },
    container: {
      style: {
        marginTop: "1%",
        marginBottom: "1%"
      }
    }
  }
};
// ListView
const listRowImageWidth = 90;
const listRowItemHeight = 130;

export const ListViewStyle = {
  listItemHeight: listRowItemHeight,
  fixedFab: {
    position: "bottom right",
    icon: "md-format-valign-top"
  },
  listRow: {
    style: {
      width: "100%"
    },
    starIcon: {
      size: commonStarSize,
      icon: "md-star",
      color: {
        gray: "#" + commonGrayColor,
        gold: "#" + commonGoldColor
      }
    },
    image: {
      width: listRowImageWidth,
      height: listRowItemHeight - 10,
      style: {
        maxWidth: listRowImageWidth + "px",
        maxHeight: listRowItemHeight - 10 + "px",
        padding: "5%" 
      }
    },
    item: {
      style: {
        height: listRowItemHeight + "px",
        paddingTop: "2px",
        paddingBottom: "2px"
      }
    },
    badge: {
      style: commonBadgeStyle
    },
    cols: {
      col1: {
        width: "30%"
      },
      col2: {
        width: "50%", 
        title: {
          style: {
            margin: "1px"
          }
        },
        addr: {
          style: {
            margin: "1px",
            color: "#A9A9A9"
          }
        }

      },
      col3: {
        width: "20%",
        button: {
          style: {
            width: "100%",
            textAlign: "center"
          }
        }
      }
    }
  }
};
// TopToggleView
export const TopToggleViewStyle = {
  innerDiv: {
    style: {
      margin: "1%"
    }
  },
  segment: {
    style: {
      width: "95%",
      marginTop: "3%"
    }
  }
};
// TopSearchView
export const TopSearchViewStyle = {
  innerDiv: {
    style: {
      marginTop: "1%",
      marginBottom: "1%",
      textAlign: "center",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
  },
  input: {
    style: {
      WebkitAppearance: "none",
      width: "78%", 
      height: "50px", 
      padding: "0px", 
      border: "1px solid #D3D3D3",
      borderRightStyle: "none",
      fontSize: "15px",
      textIndent: "3%"
    }
  },
  searchBtn: {
    style: {
      border: "1px solid #D3D3D3",
      backgroundColor: "white",
      color: "black",
      height: "50px",
      width: "50px",
      padding: "0px",
      paddingLeft: "1%"
    },
    icon: {
      img: "img/search.png",
      style: {
        width: "20px",
        margin: "auto"
      }
    }
  }
};
// FilterCarouselView
export const FilterCarouselViewStyle = {
  carouselitem: {
    arrowBtn: {
      style: {
        width: '2%',
        padding: '0px',
        height: '30px',
        fontSize: '0.7em'
      },
      innerDiv: {
        style: {
          textAlign: "center",
          margin: '0%',
          height: '30px'
        }
      }
    },
    filterBtn: {
      style: {
        width: '22%', // draw 4 buttons on single carousel
        margin: '1%',
        height: '30px',
        fontSize: '0.7em',
        padding: '1px'
      }
    }
  }
};
// DetailView
export const DetailViewStyle = {
  title: {
    style: {
      margin: "1%"
    }
  },
  common: {
    star: {
      color: {
        gray: "#" + commonGrayColor,
        gold: "#" + commonGoldColor
      },
      size: commonStarSize
    },
    image: {
      indicator: {
        container: {
          style: {
            width: "100%",
            textAlign: "center",
            fontSize: "11px"
          }
        },
        dot: {
          style: {
            cursor: "pointer"
          }
        }
      },
      google: {
        width: 400,
        height: 400
      },
      style: {
        width: "100%",
        height: "220px"
      }
    },
    card: {
      title: {
        width: "80%",
        style: {
          margin: "1%"
        }
      },
      star: {
        width: "20%",
        icon: "md-star",
        style: {
          width: "100%",
          textAlign: "center"
        }
      }
    },
    map: {
      zoom: 16,
      size: "600x250",
      style: {
        width: "100%"
      }
    }
  },
  list: {
    icons: {
      style: {
        width: "50px",
        height: "50px",
        margin: "1%"
      },
      nosmoking: "img/smoking-ban.png",
      creditcard: "img/card.png",
      parking: "img/parking.png",
      stroller: "img/stroller.png",
      nopet: "img/nopet.png",
      restroom: "img/restroom.png"
    }
  },
  modal: {
    style: {
      width: "100%",
      display: "inline-block",
      position: "relative"
    },
    img: {
      style: {
        width: "100%"
      }
    },
    close: {
      size: {
        default: 30
      },
      icon: "md-close-circle-o",
      style: {
        position: "absolute",
        top: "5%",
        right: "5%",
        color: "#" + commonGrayColor
      }
    }
  }
};
// AllFavoritesPage
export const FavoritePageStyle = {
  loadingModal: {
    style: {
      width: "100%", 
      display: "inline-block", 
      position: "relative"
    }
  },
  btns: {
    moresights: {
      style: {
        width: "80%",
        margin: "2%"
      }
    },
    moreplans: {
      style: {
        width: "80%",
        margin: "2%"
      }
    }
  }
};
// FavoritesListView
export const FavoritesListViewStyle = {
  listitem: {
    star: {
      colors: {
        gray: "#" + commonGrayColor,
        gold: "#" + commonGoldColor
      },
      size: commonStarSize,
      icon: "md-star"
    },
    row: {
      style: {
        marginTop: "10px",
        marginBottom: "10px"
      }
    },
    cols: {
      col1: {
        width: "20%",
        btn: {
          style: {
            width: "100%",
            textAlign: "center"
          }
        }
      },
      col2: {
        width: "15%"
      },
      col3: {
        width: "40%"
      },
      col4: {
        width: "25%"
      }
    }
  },
  map: {
    marker: {
      dotText: "%E2%80%A2",
      gray: commonGrayColor,
      red: commonRedColor
    },
    center: commonMapCenter,
    zoom: 9,
    size: {
      width: "100vw",
      height: "30vh"
    }
  },
  nofavorite: {
    style: {
      width: "100%",
      textAlign: "center",
      padding: "3%"
    }
  }
};
// Marker
export const MarkerStyle = {
  markerStrokeColor: "E0E0E0",
  markerLabelColor: "FFFFFF"
};
// CourseRecommandationPage
export const CourseStyle = {
  fab: {
    position: "bottom right",
    icon: "md-format-valign-top"
  },
  modal: {
    style: {
      width: "100%",
      display: "inline-block",
      position: "relative"
    }
  },
  map: {
    marker: {
      dotText: "%E2%80%A2",
      gray: commonGrayColor,
      red: commonRedColor
    },
    center: commonMapCenter,
    zoom: 9,
    size: {
      width: "100vw",
      height: "35vh"
    },
    style: {
      marginTop: "1%",
      marginBottom: "1%"
    }
  },
  star: {
    colors: {
      gray: "#" + commonGrayColor,
      gold: "#" + commonGoldColor
    },
    size: commonStarSize,
    icon: "md-star",
    btn: {
      style: {
        width: "100%",
        textAlign: "center"
      }
    }
  },
  carousel: {
    arrow: {
      size: {
        default: 30
      },
      style: {
        width: "100%",
        padding: "5%",
        marginTop: "80px" 
      },
      icons: {
        left: "md-chevron-left",
        right: "md-chevron-right"
      }
    },
    container: {
      style: {
        padding: "1px 0 0 0",
        textAlign: "center"
      }
    },
    cols: {
      col1: {
        width: "5%"
      },
      col2: {
        width: "90%",
        style: {
          width: "100%",
          height: "200px"
        }
      },
      col3: {
        width: "5%"
      }
    } 
  },
  list: {
    style: {
      marginLeft: "1%",
      marginRight: "1%"
    },
    inset: {
      style: {
        width: "100%"
      },
      item: {
        style: {
          height: "60px"
        }
      }
    }
  },
  details: {
    title: {
      style: {
        margin: "1%"
      }
    },
    card: {
      title: {
        style: {
          margin: "1%"
        }
      },
      imgs: {
        style: {
          width: "100%"
        }
      }
    },
    cols: {
      col1: {
        width: "80%"
      },
      col2: {
        width: "20%"
      }
    },
    btn: {
      style: {
        width: "80%",
        marginLeft: "10%",
        marginRight: "10%",
        marginTop: "3%"
      }
    }
  }
};
