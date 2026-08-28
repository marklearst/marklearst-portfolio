import styles from './AuroraArchitecture.module.css'

const brands = ['Chevrolet', 'Buick', 'GMC', 'Cadillac']

export default function AuroraArchitecture() {
  return (
    <figure className={styles.figure}>
      <div
        className={styles.diagram}
        role='img'
        aria-label='Conceptual Aurora architecture: Chevrolet, Buick, GMC, and Cadillac use brand-specific token themes above a shared React component layer.'
      >
        <div className={styles.label}>Aurora / system structure</div>
        <div className={styles.brands}>
          {brands.map((brand) => <span key={brand}>{brand}</span>)}
        </div>
        <div className={styles.connector} />
        <div className={styles.themeLayer}>Brand-specific token themes</div>
        <div className={styles.sharedLayer}>Shared React components</div>
      </div>
      <figcaption className={styles.caption}>
        Conceptual architecture diagram. The original internal interface is not shown.
      </figcaption>
    </figure>
  )
}
