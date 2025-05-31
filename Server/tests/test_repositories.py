import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.database import Base
from app.db.models.covid import CovidStat
from app.db.repositories.covid_repo import get_global_stats, get_countries_summary
from app.db.repositories.manage_repo import list_country_totals, update_country_totals, delete_country


@pytest.fixture(scope="function")
def db_session():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    # Ajout données test
    session.add_all([
        CovidStat(country="France", total_confirmed=100, total_deaths=10, total_recovered=50, new_cases=5, new_deaths=1, new_recovered=2, date_timestamp=1685000000),
        CovidStat(country="Germany", total_confirmed=200, total_deaths=20, total_recovered=150, new_cases=10, new_deaths=2, new_recovered=5, date_timestamp=1685000500),
    ])
    session.commit()

    yield session
    session.close()


def test_get_global_stats(db_session):
    stats = get_global_stats(db_session)
    assert stats.confirmed == 300
    assert stats.deaths == 30
    assert stats.recovered == 200
    assert stats.new_confirmed == 15
    assert stats.new_deaths == 3
    assert stats.new_recovered == 7


def test_get_countries_summary(db_session):
    summary = get_countries_summary(db_session)
    countries = [c.country for c in summary]
    assert "France" in countries and "Germany" in countries
    assert any(c.confirmed_total == 100 for c in summary)


def test_list_country_totals(db_session):
    countries = list_country_totals(db_session)
    assert any(c.country == "France" for c in countries)
    assert any(c.country == "Germany" for c in countries)


def test_update_country_totals(db_session):
    from app.schemas.manage import CountryManage

    update_data = CountryManage(id="france", country="France", total_cases=500, total_deaths=50, total_recovered=300)
    result = update_country_totals(db_session, "france", update_data)
    assert result.total_cases == 500
    assert result.total_deaths == 50
    assert result.total_recovered == 300

    # Vérifie que les valeurs ont bien été mises à jour dans la base
    france_stats = db_session.query(CovidStat).filter(CovidStat.country == "France").all()
    for stat in france_stats:
        assert stat.total_confirmed == 500
        assert stat.total_deaths == 50
        assert stat.total_recovered == 300


def test_delete_country(db_session):
    delete_country(db_session, "france")
    remaining = db_session.query(CovidStat).filter(CovidStat.country.ilike("france")).all()
    assert len(remaining) == 0
