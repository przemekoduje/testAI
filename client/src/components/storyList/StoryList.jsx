import React from "react";
import { Link } from "react-router-dom"
import "./storyList.scss"

const StoryList = () => {
  
  
  return (
    <div className="storylist">
      <span className="title">Story List</span>
      <Link className="newStory">Create a new story</Link>
      <hr/>
      <span> Recent Stories:</span>
      <div className="list">
        <Link>Chat title</Link>
        <Link>Chat title</Link>
        <Link>Chat title</Link>
        <Link>Chat title</Link>
        <Link>Chat title</Link>
        <Link>Chat title</Link>
        <Link>Chat title</Link>
        <Link>Chat title</Link>
        <Link>Chat title</Link>
        <Link>Chat title</Link>
        <Link>Chat title</Link>
        <Link>Chat title</Link>
        <Link>Chat title</Link>
        <Link>Chat title</Link>
        <Link>Chat title</Link>
      </div>

    </div>
  );
};

export default StoryList;
