import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import DbStatsCards from "../../../components/Stats/DbStatsCards/DbStatsCards";
import PageLoader from "../../../components/PageLoader/PageLoader";

import styles from "./StatsPage.module.css";

export default function StatsPage() {
  return (
    <>
      <Helmet>
        <title>Stats</title>
      </Helmet>
      <ContentContainer isAuth={true} userIsAdmin={true}>
        <header className={styles.statsHeader}>
          <h1 className={styles.headingPrimary}>Stats</h1>
        </header>
      </ContentContainer>
    </>
  );
}
